import type { GameCanvas } from "../canvas/GameCanvas";
import { drawMousePointer } from "../canvas/mousePointer";
import { CONFIG } from "../config";

let ticking = false;

let latestMouseX = 0;
let latestMouseY = 0;

function handleMouseMove(
  gameCanvas: GameCanvas,
  mouseX: number,
  mouseY: number
) {
  if (CONFIG.TRACE) {
    console.log("[TRACE] Mouse moved to", `(${mouseX}, ${mouseY})`);
  }
  drawMousePointer(gameCanvas, mouseX, mouseY);
}

export function registerCanvasMouseMoveCallback(gameCanvas: GameCanvas) {
  const { canvasElement } = gameCanvas;

  if (!canvasElement) {
    console.error("Game canvas is null");
    return;
  }

  canvasElement.addEventListener("mousemove", (event) => {
    // Get the bounding rectangle of the game canvas
    const rect = canvasElement.getBoundingClientRect();

    // Update mouse position
    latestMouseX = event.clientX - rect.left;
    latestMouseY = event.clientY - rect.top;

    // Handle on the next frame only
    if (!ticking) {
      ticking = true;

      window.requestAnimationFrame(() => {
        handleMouseMove(gameCanvas, latestMouseX, latestMouseY);
        ticking = false;
      });
    }
  });
}
