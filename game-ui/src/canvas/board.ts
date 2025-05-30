import type { GameState } from "../game/GameState";
import { drawBallOnBoard } from "./ball";
import { clearCanvas } from "./ctx";
import { drawPlayersOnBoard } from "./playerFigure";

export function redrawBoard(gameState: GameState) {
  const { figureCanvas } = gameState;

  clearCanvas(figureCanvas);
  drawBallOnBoard(gameState);
  drawPlayersOnBoard(gameState);
}
