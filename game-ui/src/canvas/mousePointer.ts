import type { GameState } from "../game/GameState";
import { FOREGROUND_COLORS } from "./colors";
import { clearCanvas } from "./ctx";

export function drawMousePointer(
  gameState: GameState,
  offsetX: number,
  offsetY: number
) {
  const { cursorCanvas } = gameState;
  const { ctx } = cursorCanvas;

  clearCanvas(cursorCanvas);
  ctx.beginPath();

  if (gameState.isPlayerAccepted) {
    ctx.fillStyle =
      FOREGROUND_COLORS[gameState.playerIndex as 0 | 1].translucent;
  } else {
    ctx.fillStyle =
      FOREGROUND_COLORS.neutral[
        gameState.darkTheme ? "darkTheme" : "lightTheme"
      ].translucent;
  }

  ctx.arc(offsetX, offsetY, 10, 0, Math.PI * 2, true);
  ctx.fill();
}

export function drawOpponentMousePointer(
  gameState: GameState,
  offsetX: number,
  offsetY: number
) {
  if (gameState.isPlayerAccepted) {
    const { opponentCursorCanvas } = gameState;
    const { ctx } = opponentCursorCanvas;

    clearCanvas(opponentCursorCanvas);
    ctx.beginPath();

    ctx.fillStyle =
      FOREGROUND_COLORS[gameState.playerIndex ? 0 : 1].translucent;

    ctx.arc(offsetX, offsetY, 10, 0, Math.PI * 2, true);
    ctx.fill();
  }
}
