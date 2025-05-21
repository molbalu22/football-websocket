import "./style.css";

const DEBUG = true;
const WEBSOCKET_URL = "http://localhost:8080";

const gameStatusElement = document.getElementById("gameStatus");

type PlayerAcceptedMessage = {
  type: "playerAccepted";
  playerId: string;
  playerIndex: number;
};

type TooManyPlayersMessage = {
  type: "tooManyPlayers";
};

type GameMessage = PlayerAcceptedMessage | TooManyPlayersMessage;

const gameState = {
  playerIndex: 0,
};

function handleMessage(ws: WebSocket, message: GameMessage) {
  // Will be useful later
  ws;

  if (message.type === "playerAccepted") {
    sessionStorage.setItem("playerId", message.playerId);
    gameState.playerIndex = message.playerIndex;

    if (gameStatusElement) {
      gameStatusElement.textContent = `You are: Player ${gameState.playerIndex}`;
    }
  } else if (message.type === "tooManyPlayers") {
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

    handleMessage(ws, message);
  };

  ws.onopen = () => {
    console.log("Websocket connection established");

    ws.send(
      JSON.stringify({
        type: "playerReady",
        playerId: sessionStorage.getItem("playerId"),
      })
    );
  };
}

try {
  connectToWebsocket();
} catch {
  console.error("Can't connect to the websocket");
}
