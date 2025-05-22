import { randomBytes } from "node:crypto";
import { WebSocket, WebSocketServer } from "ws";

import config from "./config.js";
import { Player, ServerMessage, PlayerMessage } from "./common/types.js";

console.log(config);

function generateToken(length = 56) {
  return Buffer.from(randomBytes(length)).toString("hex");
}

function sendServerMessage(ws: WebSocket, message: ServerMessage) {
  ws.send(JSON.stringify(message));
  console.log("sent:", message);
}

function sendServerMessageToAll(message: ServerMessage) {
  players.forEach((player) => {
    player.socket.send(JSON.stringify(message));
  });

  console.log("sent to all:", message);
}

let players: Array<Player> = [];

function handlePlayerMessage(player: Player, message: PlayerMessage) {
  if (message.type === "player.keyboardInput") {
    const { key, ctrlKey, metaKey, altKey, shiftKey } = message;

    if (!ctrlKey && !metaKey && !altKey && !shiftKey) {
      switch (key) {
        case "r":
          sendServerMessageToAll({
            type: "server.gameUpdate",
            update: {
              type: "squareColorUpdate",
              playerIndex: player.playerIndex,
              color: "red",
            },
          });
          break;

        case "g":
          sendServerMessageToAll({
            type: "server.gameUpdate",
            update: {
              type: "squareColorUpdate",
              playerIndex: player.playerIndex,
              color: "green",
            },
          });
          break;

        case "b":
          sendServerMessageToAll({
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
}

function registerPlayerMessageCallback(player: Player) {
  player.socket.removeAllListeners("message");

  player.socket.on("message", (data) => {
    const message = JSON.parse(data.toString());
    console.log(`received from player ${player.playerIndex}:`, message);
    handlePlayerMessage(player, message);
  });
}

function handleNewPlayerMessage(ws: WebSocket, message: PlayerMessage) {
  if (message.type === "player.joinGame") {
    if (message.playerId) {
      const playerIndex = players.findIndex(
        (player) => player.playerId === message.playerId
      );

      if (playerIndex !== -1) {
        const player = players[playerIndex];

        player.socket = ws;
        player.active = true;
        registerPlayerMessageCallback(player);

        sendServerMessage(ws, {
          type: "server.acceptPlayer",
          playerId: message.playerId,
          playerIndex,
        });

        return;
      }
    }

    if (players.length === 2) {
      sendServerMessage(ws, { type: "server.tooManyPlayers" });
      return;
    }

    const playerId = generateToken();
    const playerIndex = players.length;

    const player: Player = {
      socket: ws,
      active: true,
      playerId,
      playerIndex,
    };

    players.push(player);
    registerPlayerMessageCallback(player);

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
    handleNewPlayerMessage(ws, message);
  });

  ws.on("close", () => {
    for (const player of players) {
      if (player.socket === ws) {
        player.active = false;
        console.log("player disconnected:", player.playerId);
      }
    }
  });

  sendServerMessage(ws, { type: "server.ready" });
});
