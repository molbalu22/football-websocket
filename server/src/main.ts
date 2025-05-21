import config from "./config.js";

import { randomBytes } from "node:crypto";
import { WebSocket, WebSocketServer } from "ws";

function generateToken(length = 56) {
  return Buffer.from(randomBytes(length)).toString("hex");
}

console.log(config);

type Player = { socket: WebSocket; active: boolean; playerId: string };

let players: Array<Player> = [];

type PlayerReadyMessage = {
  type: "playerReady";
  playerId: string | null;
};

type GameMessage = PlayerReadyMessage;

function handleMessage(ws: WebSocket, message: GameMessage) {
  if (message.type === "playerReady") {
    const playerIndex = players.findIndex(
      (player) => player.playerId === message.playerId
    );

    if (playerIndex !== -1) {
      const player = players[playerIndex];

      player.socket = ws;
      player.active = true;

      ws.send(
        JSON.stringify({
          type: "playerAccepted",
          playerId: message.playerId,
          playerIndex,
        })
      );

      return;
    }

    if (players.length === 2) {
      ws.send(
        JSON.stringify({
          type: "tooManyPlayers",
        })
      );

      return;
    }

    const playerId = generateToken();

    players.push({
      socket: ws,
      active: true,
      playerId: playerId,
    });

    ws.send(
      JSON.stringify({
        type: "playerAccepted",
        playerId,
        playerIndex: players.length - 1,
      })
    );
  }
}

const wss = new WebSocketServer({ host: "0.0.0.0", port: 8080 });

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data) {
    console.log("received: %s", data);
    handleMessage(ws, JSON.parse(data.toString()));
  });

  ws.onclose = () => {
    for (const player of players) {
      if (player.socket === ws) {
        player.active = false;
      }
    }
  };

  ws.send(JSON.stringify({ type: "serverHello" }));
});
