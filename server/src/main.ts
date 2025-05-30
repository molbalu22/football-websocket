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
import { vector2Add, vector2Normalize, vector2Scale } from "./game/math.js";

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
  ...InitialCommonGameState,
};

function movePlayers(gameState: ServerGameState) {
  const { playerSpeed } = COMMON_CONFIG;

  for (const playerIndex of [0, 1] as Array<0 | 1>) {
    if (gameState.playerMousePosition[playerIndex]) {
      const posX = gameState.playerPosition[playerIndex].x;
      const posY = gameState.playerPosition[playerIndex].y;

      const mouseX = gameState.playerMousePosition[playerIndex].x;
      const mouseY = gameState.playerMousePosition[playerIndex].y;

      const playerDirection = vector2Normalize([mouseX - posX, mouseY - posY]);

      const newPos = vector2Add(
        [posX, posY],
        vector2Scale(playerDirection, playerSpeed)
      );

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
  const newPos = vector2Add([x, y], vector2Scale(gameState.ballDirection, s));

  gameState.clampedBallPosition = {
    x: newPos[0],
    y: newPos[1],
  };

  gameState.ballPosition = {
    x: newPos[0] + COMMON_CONFIG.ballRadius,
    y: newPos[1] + COMMON_CONFIG.ballRadius,
  };

  sendServerMessageToAll(gameState, {
    type: "server.gameUpdate",
    update: {
      type: "ballPositionUpdate",
      position: gameState.ballPosition,
      clampedPosition: gameState.clampedBallPosition,
    },
  });
}

function handlePlayerMessage(
  gameState: ServerGameState,
  player: Player,
  message: PlayerMessage
) {
  // player.keyboardInput
  if (message.type === "player.keyboardInput") {
    const { key, ctrlKey, metaKey, altKey, shiftKey } = message;

    if (!ctrlKey && !metaKey && !altKey && !shiftKey) {
      switch (key) {
        case "r":
          sendServerMessageToAll(gameState, {
            type: "server.gameUpdate",
            update: {
              type: "squareColorUpdate",
              playerIndex: player.playerIndex,
              color: "red",
            },
          });
          break;

        case "g":
          sendServerMessageToAll(gameState, {
            type: "server.gameUpdate",
            update: {
              type: "squareColorUpdate",
              playerIndex: player.playerIndex,
              color: "green",
            },
          });
          break;

        case "b":
          sendServerMessageToAll(gameState, {
            type: "server.gameUpdate",
            update: {
              type: "squareColorUpdate",
              playerIndex: player.playerIndex,
              color: "blue",
            },
          });
          break;
      }
    }
  }

  // player.mouseMove
  else if (message.type === "player.mouseMove") {
    if (!gameState.isGameRunning) {
      gameState.isGameRunning = true;
      const updateLoop = new UpdateLoop(gameState);
      updateLoop.onUpdate(movePlayers);
      updateLoop.onUpdate(moveBall);
      updateLoop.start();

      setTimeout(() => {
        gameState.lastBallKickTime = performance.now();
        gameState.clampedBallKickPosition = gameState.clampedBallPosition;
      }, 3000);
    }

    gameState.playerMousePosition[player.playerIndex as 0 | 1] = {
      x: message.mouseX,
      y: message.mouseY,
    };
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
