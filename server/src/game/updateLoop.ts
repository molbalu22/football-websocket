import config from "../config.js";
import { ServerGameState } from "./ServerGameState.js";

const { fps } = config;
const CYCLE_DURATION = 1000 / fps;
const CYCLE_COUNTER_MAX = 1000000;

export class UpdateLoop {
  gameState: ServerGameState;
  startTime: number;
  cycleCounter: number;
  nextTick: number;

  constructor(gameState: ServerGameState) {
    this.gameState = gameState;
    this.startTime = 0;
    this.cycleCounter = 0;
    this.nextTick = 0;
  }

  start() {
    this.startTime = performance.now();
    this.runCycle();
  }

  runCycle() {
    this.advanceCycleCounter();

    setTimeout(() => this.runCycle(), this.nextTick - performance.now());

    if (!this.gameState.isGameRunning) {
      console.log(`Cycle ${this.cycleCounter} @ ${performance.now()}`);
      return;
    }
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
