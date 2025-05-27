import { WebSocket } from "ws";

import { COMMON_CONFIG } from "../config.js";

export type Player = {
  socket: WebSocket;
  active: boolean;
  playerId: string;
  playerIndex: number;
};

export type CommonGameState = {
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

const { playerRadius, stageSize, playerInitialXOffset } = COMMON_CONFIG;

export const InitialCommonGameState: CommonGameState = {
  isGameRunning: false,
  playerPosition: {
    0: {
      x: playerInitialXOffset,
      y: stageSize.height / 2 - playerRadius / 2,
    },
    1: {
      x: stageSize.width - playerInitialXOffset,
      y: stageSize.height / 2 - playerRadius / 2,
    },
  },
  playerMousePosition: {
    0: null,
    1: null,
  },
};
