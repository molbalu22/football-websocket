import { CONFIG } from "../config";
import type { GameState } from "../game/GameState";

let ticking = false;

let latestMouseX = 0;
let latestMouseY = 0;

const mouseMoveSubscribers: Array<
  (gameState: GameState, mouseX: number, mouseY: number) => void
> = [];

export function onMouseMove(
  callback: (gameState: GameState, mouseX: number, mouseY: number) => void
) {
  mouseMoveSubscribers.push(callback);
}

function handleMouseMove(gameState: GameState, mouseX: number, mouseY: number) {
  if (CONFIG.TRACE) {
    console.log("[TRACE] Mouse moved to", `(${mouseX}, ${mouseY})`);
  }

  mouseMoveSubscribers.forEach((callback) =>
    callback(gameState, mouseX, mouseY)
  );
}

export function registerMouseMoveCallback(gameState: GameState) {
  const { cursorCanvas } = gameState;
  const { canvasElement } = cursorCanvas;

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
        handleMouseMove(gameState, latestMouseX, latestMouseY);
        ticking = false;
      });
    }
  });
}
