import { prepareBoard } from "./canvas/board";
import { GameStageError, getGameStage } from "./canvas/ctx";
import { drawMousePointer } from "./canvas/mousePointer";
import { InitialCommonGameState } from "./common/types";
import { onMouseMove, registerMouseMoveCallback } from "./events/mouse";
import type { GameState } from "./game/GameState";
import { connectToWebsocket, sendPlayerMessage } from "./game/websocket";
import "./style.css";

function main() {
  const gameStage = getGameStage();

  if (gameStage instanceof GameStageError) {
    console.error(gameStage.errorMsg);
    return;
  }

  const gameState: GameState = {
    socket: null,
    isPlayerAccepted: false,
    playerIndex: 0,
    darkTheme: document.body.dataset.theme === "dark",
    ...gameStage,
    ...InitialCommonGameState,
  };

  prepareBoard(gameState);

  try {
    connectToWebsocket(gameState);
  } catch {
    console.error("Can't connect to the websocket");
    return;
  }

  onMouseMove(drawMousePointer);

  onMouseMove((gameState, mouseX, mouseY) => {
    if (gameState.socket && gameState.isPlayerAccepted) {
      sendPlayerMessage(gameState.socket, {
        type: "player.mouseMove",
        mouseX,
        mouseY,
      });
    }
  });

  registerMouseMoveCallback(gameState);
}

main();
