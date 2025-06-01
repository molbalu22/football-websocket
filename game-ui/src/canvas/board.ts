import type { GameState } from "../game/GameState";
import { drawBallOnBoard } from "./ball";
import { clearCanvas } from "./ctx";
import { drawGoalsOnBoard } from "./goal";
import { drawPlayersOnBoard } from "./playerFigure";

export function redrawBoard(gameState: GameState) {
  const { figureCanvas, ballCanvas } = gameState;

  clearCanvas(figureCanvas);
  clearCanvas(ballCanvas);
  drawBallOnBoard(gameState);
  drawPlayersOnBoard(gameState);
}

export function prepareBoard(gameState: GameState) {
  drawGoalsOnBoard(gameState);
}
