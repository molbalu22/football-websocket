import { COMMON_CONFIG } from "../common/config";
import type { GameState } from "../game/GameState";
import { FOREGROUND_COLORS } from "./colors";

export function drawGoal(
  gameState: GameState,
  playerIndex: 0 | 1,
  offsetX: number,
  offsetY: number
) {
  const { goalWidth, goalHeight } = COMMON_CONFIG;
  const { backgroundCanvas } = gameState;
  const { ctx } = backgroundCanvas;

  ctx.fillStyle = FOREGROUND_COLORS[playerIndex].solid;
  ctx.fillRect(offsetX, offsetY, goalWidth, goalHeight);
}

export function drawGoalsOnBoard(gameState: GameState) {
  const { goalWidth, goalHeight, stageSize } = COMMON_CONFIG;

  const offsetY = (stageSize.height - goalHeight) / 2;

  drawGoal(gameState, 0, 0, offsetY);
  drawGoal(gameState, 1, stageSize.width - goalWidth, offsetY);
}
