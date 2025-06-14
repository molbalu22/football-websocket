import { redrawBoard } from "../canvas/board";
import { onEachFrame, startRenderLoop } from "../canvas/renderLoop";
import type { PlayerMessage, ServerMessage } from "../common/types";
import { CONFIG } from "../config";
import type { GameState } from "./GameState";

const gameStatusElement = document.getElementById("gameStatus");
const gameTimer = document.getElementById("gameTimer");

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

function setGameTimer(gameState: GameState) {
  const { remainingSec } = gameState;

  const mins = Math.floor(remainingSec / 60);
  const secs = Math.floor(remainingSec % 60);

  const minStr = mins.toString().padStart(2, "0");
  const secStr = secs.toString().padStart(2, "0");

  if (gameTimer) {
    gameTimer.innerText = `${minStr}:${secStr}`;
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
    onEachFrame(setGameTimer);
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
      gameState.score = update.score;

      if (gameScore[0]) {
        gameScore[0].textContent = update.score[0].toString();
      }

      if (gameScore[1]) {
        gameScore[1].textContent = update.score[1].toString();
      }
    }

    // gameTimeUpdate
    else if (update.type === "gameTimeUpdate") {
      gameState.remainingSec = update.remainingSec;
    }

    // gameEndUpdate
    else if (update.type === "gameEndUpdate") {
      let winner: number | null;

      if (gameState.score[0] > gameState.score[1]) {
        winner = 0;
      } else if (gameState.score[1] > gameState.score[0]) {
        winner = 1;
      } else {
        winner = null;
      }

      if (winner !== null) {
        const whoHasWonSpanElement = document.getElementById("whoHasWon");

        if (whoHasWonSpanElement) {
          whoHasWonSpanElement.classList.toggle("text-red-500", winner === 0);
          whoHasWonSpanElement.classList.toggle("text-blue-500", winner === 1);
          whoHasWonSpanElement.innerText = winner === 0 ? "RED" : "BLUE";
        }

        const winElement = document.getElementById("win");

        if (winElement) {
          winElement.style.display = "block";
        }
      } else {
        const drawElement = document.getElementById("draw");

        if (drawElement) {
          drawElement.style.display = "block";
        }
      }

      const fadeElement = document.getElementById("fade");

      if (fadeElement) {
        fadeElement.style.visibility = "visible";
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
