import { COMMON_CONFIG } from "../common/config.js";
import { ServerGameState } from "./ServerGameState.js";

const { fps } = COMMON_CONFIG;
const CYCLE_DURATION = 1000 / fps;
const CYCLE_COUNTER_MAX = 1000000;

export class UpdateLoop {
  gameState: ServerGameState;

  startTime: number;
  cycleCounter: number;
  nextTick: number;

  onUpdateSubscribers: Array<(gameState: ServerGameState) => void>;

  constructor(gameState: ServerGameState) {
    this.gameState = gameState;

    this.startTime = 0;
    this.cycleCounter = 0;
    this.nextTick = 0;

    this.onUpdateSubscribers = [];
  }

  onUpdate(callback: (gameState: ServerGameState) => void) {
    this.onUpdateSubscribers.push(callback);
  }

  start() {
    this.startTime = performance.now();
    this.runCycle();
  }

  runCycle() {
    this.advanceCycleCounter();

    setTimeout(() => this.runCycle(), this.nextTick - performance.now());

    if (!this.gameState.isGameRunning) {
      return;
    }

    console.log(`Cycle ${this.cycleCounter} @ ${performance.now()}`);

    this.onUpdateSubscribers.forEach((callback) => {
      callback(this.gameState);
    });
  }

  advanceCycleCounter() {
    this.cycleCounter++;
    this.nextTick = this.startTime + this.cycleCounter * CYCLE_DURATION;

    if (this.cycleCounter > CYCLE_COUNTER_MAX) {
      this.startTime = this.nextTick;
      this.cycleCounter = 0;
    }
  }
}
