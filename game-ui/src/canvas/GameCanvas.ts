export type GameStage = {
  cursorCanvas: GameCanvas;
  figureCanvas: GameCanvas;
  ballCanvas: GameCanvas;
  backgroundCanvas: GameCanvas;
};

export type GameCanvas = {
  canvasElement: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
};
