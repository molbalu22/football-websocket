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
  console.log("sent: %s", message);
}

let players: Array<Player> = [];

function handlePlayerMessage(ws: WebSocket, message: PlayerMessage) {
  if (message.type === "player.joinGame") {
    if (message.playerId) {
      const playerIndex = players.findIndex(
        (player) => player.playerId === message.playerId
      );

      if (playerIndex !== -1) {
        const player = players[playerIndex];

        player.socket = ws;
        player.active = true;

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

    players.push({
      socket: ws,
      active: true,
      playerId: playerId,
    });

    sendServerMessage(ws, {
      type: "server.acceptPlayer",
      playerId,
      playerIndex: players.length - 1,
    });
  }
}

const wss = new WebSocketServer({ host: "0.0.0.0", port: 8080 });

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data) {
    const message = JSON.parse(data.toString());
    console.log("received: %s", message);
    handlePlayerMessage(ws, message);
  });

  ws.onclose = () => {
    for (const player of players) {
      if (player.socket === ws) {
        player.active = false;
        console.log("player disconnected: %s", player.playerId);
      }
    }
  };

  sendServerMessage(ws, { type: "server.ready" });
});
