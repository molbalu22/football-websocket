import { randomBytes } from "node:crypto";
import { WebSocket, WebSocketServer } from "ws";

import config from "./config.js";
import {
  Player,
  ServerMessage,
  PlayerMessage,
  InitialCommonGameState,
} from "./common/types.js";
import { ServerGameState } from "./game/ServerGameState.js";
import { COMMON_CONFIG } from "./common/config.js";
import { UpdateLoop } from "./game/updateLoop.js";
import {
  clampMousePostion,
  reflectBallInsideStage,
  unclampBallPostion,
  vector2Add,
  vector2Length,
  vector2Normalize,
  vector2Scale,
} from "./game/math.js";

console.log(config);

function generateToken(length = 56) {
  return Buffer.from(randomBytes(length)).toString("hex");
}

function sendServerMessage(ws: WebSocket, message: ServerMessage) {
  ws.send(JSON.stringify(message));
  console.log("sent:", message);
}

function sendServerMessageToAll(
  gameState: ServerGameState,
  message: ServerMessage
) {
  gameState.players.forEach((player) => {
    player.socket.send(JSON.stringify(message));
  });

  console.log("sent to all:", message);
}

const gameState: ServerGameState = {
  players: [],
  ...InitialCommonGameState(),
};

function movePlayers(gameState: ServerGameState) {
  const { playerSpeed } = COMMON_CONFIG;

  for (const playerIndex of [0, 1] as Array<0 | 1>) {
    if (gameState.clampedPlayerMousePosition[playerIndex]) {
      const posX = gameState.playerPosition[playerIndex].x;
      const posY = gameState.playerPosition[playerIndex].y;

      const mouseX = gameState.clampedPlayerMousePosition[playerIndex].x;
      const mouseY = gameState.clampedPlayerMousePosition[playerIndex].y;

      const diff: [number, number] = [mouseX - posX, mouseY - posY];

      let newPos: [number, number];

      // Prevent jitter (when the player is close to the cursor)
      if (vector2Length(diff) < playerSpeed) {
        newPos = [mouseX, mouseY];
      } else {
        const playerDirection = vector2Normalize(diff);
        newPos = vector2Add(
          [posX, posY],
          vector2Scale(playerDirection, playerSpeed)
        );
      }

      gameState.playerPosition[playerIndex].x = newPos[0];
      gameState.playerPosition[playerIndex].y = newPos[1];
    }
  }

  sendServerMessageToAll(gameState, {
    type: "server.gameUpdate",
    update: {
      type: "playerPositionUpdate",
      position: gameState.playerPosition,
    },
  });
}

function moveBall(gameState: ServerGameState) {
  if (!(gameState.lastBallKickTime && gameState.clampedBallKickPosition)) {
    return;
  }

  const v0 = COMMON_CONFIG.ballKickSpeed;
  const a = COMMON_CONFIG.ballAcceleration;
  const t = (performance.now() - gameState.lastBallKickTime) / 1000;

  if (t > v0 / -a) {
    return;
  }

  const s = v0 * t + (a / 2) * t * t;

  const { clampedBallKickPosition } = gameState;
  const { x, y } = clampedBallKickPosition;
  const newPos = reflectBallInsideStage(
    vector2Add([x, y], vector2Scale(gameState.ballDirection, s))
  );

  gameState.clampedBallPosition = {
    x: newPos[0],
    y: newPos[1],
  };

  gameState.ballPosition = unclampBallPostion({
    x: newPos[0],
    y: newPos[1],
  });

  sendServerMessageToAll(gameState, {
    type: "server.gameUpdate",
    update: {
      type: "ballPositionUpdate",
      position: gameState.ballPosition,
      clampedPosition: gameState.clampedBallPosition,
    },
  });
}

function setBallKickParams(gameState: ServerGameState) {
  const { playerRadius } = COMMON_CONFIG;
  const { x, y } = gameState.clampedBallPosition;

  const clampedBallKickVector = vector2Add(
    [x, y],
    vector2Scale(gameState.ballDirection, playerRadius + 2)
  );

  gameState.lastBallKickTime = performance.now();
  gameState.clampedBallKickPosition = {
    x: clampedBallKickVector[0],
    y: clampedBallKickVector[1],
  };
}

function computeCollisions(gameState: ServerGameState) {
  const gracePeriodMs = 300;

  if (performance.now() - gameState.lastBallKickTime < gracePeriodMs) {
    return;
  }

  const { playerRadius, ballRadius } = COMMON_CONFIG;
  const { playerPosition, ballPosition } = gameState;

  const posPlayer0 = playerPosition[0];
  const posPlayer1 = playerPosition[1];

  const diffPlayer0: [number, number] = [
    ballPosition.x - posPlayer0.x,
    ballPosition.y - posPlayer0.y,
  ];
  const diffPlayer1: [number, number] = [
    ballPosition.x - posPlayer1.x,
    ballPosition.y - posPlayer1.y,
  ];

  const distPlayer0 = vector2Length(diffPlayer0);
  const distPlayer1 = vector2Length(diffPlayer1);

  const hitDistance = playerRadius + ballRadius;

  if (distPlayer0 < hitDistance) {
    gameState.ballDirection = vector2Normalize(diffPlayer0);
    setBallKickParams(gameState);
  }

  if (distPlayer1 < hitDistance && distPlayer1 < distPlayer0) {
    gameState.ballDirection = vector2Normalize(diffPlayer1);
    setBallKickParams(gameState);
  }
}

function sendScoreUpdateToAll(gameState: ServerGameState) {
  sendServerMessageToAll(gameState, {
    type: "server.gameUpdate",
    update: {
      type: "scoreUpdate",
      score: gameState.score,
    },
  });
}

function awardPoints(gameState: ServerGameState) {
  const { ballRadius, goalWidth, goalHeight, stageSize } = COMMON_CONFIG;
  const { width, height } = stageSize;
  const { ballPosition } = gameState;
  const { x, y } = ballPosition;

  const ballInGoal0 =
    x <= goalWidth + ballRadius &&
    y >= (height - goalHeight) / 2 &&
    y <= (height + goalHeight) / 2;

  const ballInGoal1 =
    x >= width - goalWidth - ballRadius &&
    y >= (height - goalHeight) / 2 &&
    y <= (height + goalHeight) / 2;

  if (!gameState.isBallInGoal && ballInGoal0) {
    gameState.score[1] += 1;
    sendScoreUpdateToAll(gameState);
  }

  if (!gameState.isBallInGoal && ballInGoal1) {
    gameState.score[0] += 1;
    sendScoreUpdateToAll(gameState);
  }

  gameState.isBallInGoal = ballInGoal0 || ballInGoal1;
}

function sendGameTimeUpdateToAll(gameState: ServerGameState) {
  const { gameDurationSec } = COMMON_CONFIG;

  const elapsedSec = (performance.now() - gameState.gameStartTime) / 1000;
  const remainingSec = gameDurationSec - elapsedSec;

  if (remainingSec <= 0) {
    sendServerMessageToAll(gameState, {
      type: "server.gameUpdate",
      update: {
        type: "gameTimeUpdate",
        remainingSec: 0,
      },
    });

    sendServerMessageToAll(gameState, {
      type: "server.gameUpdate",
      update: {
        type: "gameEndUpdate",
      },
    });

    gameState.isGameRunning = false;
    gameState.gameEnded = true;

    return;
  }

  sendServerMessageToAll(gameState, {
    type: "server.gameUpdate",
    update: {
      type: "gameTimeUpdate",
      remainingSec,
    },
  });
}

function handlePlayerMessage(
  gameState: ServerGameState,
  player: Player,
  message: PlayerMessage
) {
  // player.mouseMove
  if (message.type === "player.mouseMove") {
    if (!gameState.isGameRunning && !gameState.gameEnded) {
      gameState.isGameRunning = true;
      gameState.gameStartTime = performance.now();
      const updateLoop = new UpdateLoop(gameState);
      updateLoop.onUpdate(movePlayers);
      updateLoop.onUpdate(moveBall);
      updateLoop.onUpdate(computeCollisions);
      updateLoop.onUpdate(awardPoints);
      updateLoop.onUpdate(sendGameTimeUpdateToAll);
      updateLoop.start();
    }

    gameState.playerMousePosition[player.playerIndex as 0 | 1] = {
      x: message.mouseX,
      y: message.mouseY,
    };

    gameState.clampedPlayerMousePosition[player.playerIndex as 0 | 1] =
      clampMousePostion({
        x: message.mouseX,
        y: message.mouseY,
      });
  }
}

function registerPlayerMessageCallback(
  gameState: ServerGameState,
  player: Player
) {
  player.socket.removeAllListeners("message");

  player.socket.on("message", (data) => {
    const message = JSON.parse(data.toString());
    console.log(`received from player ${player.playerIndex}:`, message);
    handlePlayerMessage(gameState, player, message);
  });
}

function handleNewPlayerMessage(
  gameState: ServerGameState,
  ws: WebSocket,
  message: PlayerMessage
) {
  if (message.type === "player.joinGame") {
    if (message.playerId) {
      const playerIndex = gameState.players.findIndex(
        (player) => player.playerId === message.playerId
      );

      if (playerIndex !== -1) {
        const player = gameState.players[playerIndex];

        player.socket = ws;
        player.active = true;
        registerPlayerMessageCallback(gameState, player);

        sendServerMessage(ws, {
          type: "server.acceptPlayer",
          playerId: message.playerId,
          playerIndex,
        });

        return;
      }
    }

    if (gameState.players.length === 2) {
      sendServerMessage(ws, { type: "server.tooManyPlayers" });
      return;
    }

    const playerId = generateToken();
    const playerIndex = gameState.players.length;

    const player: Player = {
      socket: ws,
      active: true,
      playerId,
      playerIndex,
    };

    gameState.players.push(player);
    registerPlayerMessageCallback(gameState, player);

    sendServerMessage(ws, {
      type: "server.acceptPlayer",
      playerId,
      playerIndex,
    });
  }
}

const wss = new WebSocketServer({ host: "0.0.0.0", port: 8080 });

wss.on("connection", (ws) => {
  ws.on("error", console.error);

  ws.on("message", (data) => {
    const message = JSON.parse(data.toString());
    console.log("received:", message);
    handleNewPlayerMessage(gameState, ws, message);
  });

  ws.on("close", () => {
    for (const player of gameState.players) {
      if (player.socket === ws) {
        player.active = false;
        console.log("player disconnected:", player.playerId);
      }
    }
  });

  sendServerMessage(ws, { type: "server.ready" });
});
