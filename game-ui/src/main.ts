import type { PlayerMessage, ServerMessage } from "./common/types";
import "./style.css";

const DEBUG = true;
const WEBSOCKET_URL = "http://localhost:8080";

const gameStatusElement = document.getElementById("gameStatus");

const gameState = {
  playerIndex: 0,
};

function sendPlayerMessage(ws: WebSocket, message: PlayerMessage) {
  ws.send(JSON.stringify(message));

  if (DEBUG) {
    console.log("[DEBUG] Websocket message sent:");
    console.log(message);
  }
}

function handleServerMessage(ws: WebSocket, message: ServerMessage) {
  // Will be useful later
  ws;

  if (message.type === "server.acceptPlayer") {
    sessionStorage.setItem("playerId", message.playerId);
    gameState.playerIndex = message.playerIndex;

    if (gameStatusElement) {
      gameStatusElement.textContent = `You are: Player ${gameState.playerIndex}`;
    }
  } else if (message.type === "server.tooManyPlayers") {
    if (gameStatusElement) {
      gameStatusElement.textContent =
        "Sorry, you can't join now. There are too many players in the game.";
    }
  }
}

async function connectToWebsocket() {
  const ws = new WebSocket(WEBSOCKET_URL);

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (DEBUG) {
      console.log("[DEBUG] Websocket message received:");
      console.log(message);
    }

    handleServerMessage(ws, message);
  };

  ws.onopen = () => {
    console.log("Websocket connection established");

    sendPlayerMessage(ws, {
      type: "player.joinGame",
      playerId: sessionStorage.getItem("playerId"),
    });
  };
}

try {
  connectToWebsocket();
} catch {
  console.error("Can't connect to the websocket");
}
