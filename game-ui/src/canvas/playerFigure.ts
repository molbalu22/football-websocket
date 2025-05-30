import { COMMON_CONFIG } from "../common/config";
import type { GameState } from "../game/GameState";
import { FOREGROUND_COLORS } from "./colors";

export function drawPlayerFigure(
  gameState: GameState,
  playerIndex: 0 | 1,
  offsetX: number,
  offsetY: number
) {
  const { playerRadius } = COMMON_CONFIG;
  const { figureCanvas } = gameState;
  const { ctx } = figureCanvas;

  ctx.beginPath();
  ctx.fillStyle = FOREGROUND_COLORS[playerIndex].solid;
  ctx.arc(offsetX, offsetY, playerRadius, 0, Math.PI * 2, true);
  ctx.fill();
}

export function drawPlayersOnBoard(gameState: GameState) {
  const { playerPosition } = gameState;

  drawPlayerFigure(gameState, 0, playerPosition[0].x, playerPosition[0].y);
  drawPlayerFigure(gameState, 1, playerPosition[1].x, playerPosition[1].y);
}
