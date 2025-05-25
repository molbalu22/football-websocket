export type GameStage = {
  cursorCanvas: GameCanvas;
  opponentCursorCanvas: GameCanvas;
  figureCanvas: GameCanvas;
};

export type GameCanvas = {
  canvasElement: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
};
