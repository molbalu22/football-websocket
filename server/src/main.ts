import { randomBytes } from "node:crypto";
import { WebSocket, WebSocketServer } from "ws";

import config from "./config.js";
import { Player, ServerMessage, PlayerMessage } from "./common/types.js";
import { ServerGameState } from "./game/ServerGameState.js";
import { COMMON_CONFIG } from "./common/config.js";
import { UpdateLoop } from "./game/updateLoop.js";

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

const { playerRadius, stageSize, playerInitialXOffset } = COMMON_CONFIG;

const gameState: ServerGameState = {
  players: [],
  playerPosition: {
    0: {
      x: playerInitialXOffset,
      y: stageSize.height / 2 - playerRadius / 2,
    },
    1: {
      x: stageSize.width - playerInitialXOffset,
      y: stageSize.height / 2 - playerRadius / 2,
    },
  },
  playerMousePosition: {
    0: null,
    1: null,
  },
  isGameRunning: false,
};

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
    sendServerMessageToAll(gameState, {
      type: "server.gameUpdate",
      update: {
        type: "playerPositionUpdate",
        playerIndex: player.playerIndex,
        mouseX: message.mouseX,
        mouseY: message.mouseY,
      },
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

const updateLoop = new UpdateLoop(gameState);
updateLoop.start();
