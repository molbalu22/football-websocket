import { COMMON_CONFIG } from "../common/config";
import type { GameState } from "../game/GameState";
import { FOREGROUND_COLORS } from "./colors";
import { clearCanvas } from "./ctx";

export function drawPlayerFigure(
  gameState: GameState,
  offsetX: number,
  offsetY: number
) {
  const { figureCanvas } = gameState;
  const { ctx } = figureCanvas;

  clearCanvas(figureCanvas);
  ctx.beginPath();

  if (gameState.isPlayerAccepted) {
    ctx.fillStyle = FOREGROUND_COLORS[gameState.playerIndex as 0 | 1].solid;
  } else {
    ctx.fillStyle =
      FOREGROUND_COLORS.neutral[
        gameState.darkTheme ? "darkTheme" : "lightTheme"
      ].solid;
  }

  const { playerRadius } = COMMON_CONFIG;

  ctx.arc(offsetX, offsetY, playerRadius, 0, Math.PI * 2, true);
  ctx.fill();
}

export function placePlayerOnBoard(gameState: GameState) {
  const { playerRadius, stageSize } = COMMON_CONFIG;

  if (gameState.playerIndex === 0) {
    drawPlayerFigure(gameState, 50, stageSize.height / 2 - playerRadius / 2);
  } else {
    drawPlayerFigure(
      gameState,
      stageSize.width - 50,
      stageSize.height / 2 - playerRadius / 2
    );
  }
}
