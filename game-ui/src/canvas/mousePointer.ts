import type { GameCanvas } from "./GameCanvas";
import { clearCanvas } from "./ctx";

export function drawMousePointer(
  gameCanvas: GameCanvas,
  offsetX: number,
  offsetY: number
) {
  const { canvasCtx } = gameCanvas;

  clearCanvas(gameCanvas);
  canvasCtx.beginPath();
  canvasCtx.fillStyle = "oklch(0.637 0.237 25.331 / .2)";
  canvasCtx.arc(offsetX, offsetY, 10, 0, Math.PI * 2, true);
  canvasCtx.fill();
}
