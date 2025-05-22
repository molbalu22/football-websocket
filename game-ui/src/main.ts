import type { PlayerMessage, ServerMessage } from "./common/types";
import "./style.css";

const DEBUG = true;
const WEBSOCKET_URL = "http://localhost:8080";

const gameStatusElement = document.getElementById("gameStatus");

const gameSquares = [
  document.getElementById("game-square-index-0"),
  document.getElementById("game-square-index-1"),
];

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

  // server.acceptPlayer
  if (message.type === "server.acceptPlayer") {
    sessionStorage.setItem("playerId", message.playerId);
    gameState.playerIndex = message.playerIndex;

    if (gameStatusElement) {
      gameStatusElement.textContent = `You are: Player ${gameState.playerIndex}`;
    }
  }

  // server.tooManyPlayers
  else if (message.type === "server.tooManyPlayers") {
    if (gameStatusElement) {
      gameStatusElement.textContent =
        "Sorry, you can't join now. There are too many players in the game.";
    }
  }

  // server.gameUpdate
  else if (message.type === "server.gameUpdate") {
    const { update } = message;

    if (update.type === "squareColorUpdate") {
      const newSquare = document.createElement("div");
      newSquare.id = `game-square-index-${update.playerIndex}`;
      newSquare.classList.add(
        update.color === "red" ? "bg-red-500" : "null",
        update.color === "green" ? "bg-green-500" : "null",
        update.color === "blue" ? "bg-blue-500" : "null",
        "w-48",
        "h-48",
        "rounded",
        "flex",
        "items-center",
        "justify-center"
      );

      newSquare.innerHTML = `<div class="text-7xl text-white">${update.playerIndex}</div>`;

      gameSquares[update.playerIndex]?.replaceWith(newSquare);
      gameSquares[update.playerIndex] = newSquare;
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

    document.addEventListener("keydown", (event) => {
      sendPlayerMessage(ws, {
        type: "player.keyboardInput",
        key: event.key,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
      });
    });
  };
}

try {
  connectToWebsocket();
} catch {
  console.error("Can't connect to the websocket");
}
