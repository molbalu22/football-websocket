import { redrawBoard } from "../canvas/board";
import { onEachFrame, startRenderLoop } from "../canvas/renderLoop";
import type { PlayerMessage, ServerMessage } from "../common/types";
import { CONFIG } from "../config";
import type { GameState } from "./GameState";

const gameStatusElement = document.getElementById("gameStatus");

const gameScore = {
  0: document.getElementById("score-value-0"),
  1: document.getElementById("score-value-1"),
};

function logServerMessageToConsole(message: ServerMessage) {
  const isMessageTraceLevel =
    message.type === "server.gameUpdate" &&
    message.update.type === "playerPositionUpdate";

  if (isMessageTraceLevel) {
    if (CONFIG.TRACE) {
      console.log("[TRACE] Websocket message received:");
      console.log(message);
    }

    return;
  }

  if (CONFIG.DEBUG) {
    console.log("[DEBUG] Websocket message received:");
    console.log(message);
  }
}

export function sendPlayerMessage(ws: WebSocket, message: PlayerMessage) {
  ws.send(JSON.stringify(message));

  if (CONFIG.DEBUG) {
    console.log("[DEBUG] Websocket message sent:");
    console.log(message);
  }
}

function handleServerMessage(
  gameState: GameState,
  ws: WebSocket,
  message: ServerMessage
) {
  // Will be useful later
  ws;

  // server.acceptPlayer
  if (message.type === "server.acceptPlayer") {
    sessionStorage.setItem("playerId", message.playerId);
    gameState.isPlayerAccepted = true;
    gameState.playerIndex = message.playerIndex;

    if (gameStatusElement) {
      const classList = ["bold"];

      if (gameState.playerIndex === 0) {
        classList.push("text-red-500");
      } else {
        classList.push("text-blue-500");
      }

      const className = classList.join(" ");

      let playerName;

      if (gameState.playerIndex === 0) {
        playerName = "Red";
      } else {
        playerName = "Blue";
      }

      gameStatusElement.innerHTML = `You are: <span class="${className}">${playerName}</span>`;
    }

    onEachFrame(redrawBoard);
    startRenderLoop(gameState);
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

    // playerPositionUpdate
    if (update.type === "playerPositionUpdate") {
      gameState.playerPosition = update.position;
    }

    // ballPositionUpdate
    else if (update.type === "ballPositionUpdate") {
      gameState.ballPosition = update.position;
      gameState.clampedBallPosition = update.clampedPosition;
    }

    // scoreUpdate
    else if (update.type === "scoreUpdate") {
      if (gameScore[0]) {
        gameScore[0].textContent = update.score[0].toString();
      }

      if (gameScore[1]) {
        gameScore[1].textContent = update.score[1].toString();
      }
    }
  }
}

export async function connectToWebsocket(gameState: GameState) {
  const ws = new WebSocket(CONFIG.WEBSOCKET_URL);

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    logServerMessageToConsole(message);
    handleServerMessage(gameState, ws, message);
  };

  ws.onopen = () => {
    console.log("Websocket connection established");
    gameState.socket = ws;

    sendPlayerMessage(ws, {
      type: "player.joinGame",
      playerId: sessionStorage.getItem("playerId"),
    });
  };
}
