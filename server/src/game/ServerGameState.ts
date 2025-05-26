import { Player } from "../common/types.js";

export type ServerGameState = {
  players: Array<Player>;
  playerPosition: {
    0: {
      x: number;
      y: number;
    };
    1: {
      x: number;
      y: number;
    };
  };
  playerMousePosition: {
    0: {
      x: number;
      y: number;
    } | null;
    1: {
      x: number;
      y: number;
    } | null;
  };
  isGameRunning: boolean;
};
