import { COMMON_CONFIG } from "../common/config";
import type { GameState } from "../game/GameState";
import { FOREGROUND_COLORS } from "./colors";

export function drawBallOnBoard(gameState: GameState) {
  const { ballRadius } = COMMON_CONFIG;
  const { ballPosition, ballCanvas } = gameState;
  const { x, y } = ballPosition;
  const { ctx } = ballCanvas;

  ctx.beginPath();
  ctx.fillStyle =
    FOREGROUND_COLORS.neutral[
      gameState.darkTheme ? "darkTheme" : "lightTheme"
    ].solid;
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2, true);
  ctx.fill();
}
