import type { GameState } from "../game/GameState";

const onEachFrameSubscribers: Array<(gameState: GameState) => void> = [];

export function onEachFrame(callback: (gameState: GameState) => void) {
  onEachFrameSubscribers.push(callback);
}

export function startRenderLoop(gameState: GameState) {
  window.requestAnimationFrame(() => runRenderCycle(gameState));
}

function runRenderCycle(gameState: GameState) {
  window.requestAnimationFrame(() => runRenderCycle(gameState));

  onEachFrameSubscribers.forEach((callback) => {
    callback(gameState);
  });
}
