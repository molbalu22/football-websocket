import { GameCanvasError, getGameCanvas } from "./canvas/ctx";
import { registerCanvasMouseMoveCallback } from "./events/mouse";
import type { GameState } from "./game/GameState";
import { connectToWebsocket } from "./game/websocket";
import "./style.css";

function main() {
  const gameCanvas = getGameCanvas();

  if (gameCanvas instanceof GameCanvasError) {
    console.error(gameCanvas.errorMsg);
    return;
  }

  const gameState: GameState = {
    playerIndex: 0,
    ...gameCanvas,
  };

  try {
    connectToWebsocket(gameState);
  } catch {
    console.error("Can't connect to the websocket");
    return;
  }

  registerCanvasMouseMoveCallback(gameCanvas);
}

main();
