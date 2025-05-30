import { WebSocket } from "ws";

import { COMMON_CONFIG } from "../config.js";

export type Player = {
  socket: WebSocket;
  active: boolean;
  playerId: string;
  playerIndex: number;
};

export type CommonGameState = {
  isGameRunning: boolean;

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

  // Clamping to make sure the player figure cannot be dragged too close to the board edge
  clampedPlayerMousePosition: {
    0: {
      x: number;
      y: number;
    } | null;
    1: {
      x: number;
      y: number;
    } | null;
  };

  ballPosition: {
    x: number;
    y: number;
  };

  // Clamping to make sure the ball cannot go too close to the board edge
  clampedBallPosition: {
    x: number;
    y: number;
  };

  clampedBallKickPosition: {
    x: number;
    y: number;
  } | null;

  lastBallKickTime: number;
  ballDirection: [number, number];
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
  clampedPlayerMousePosition: {
    0: null,
    1: null,
  },
  ballPosition: {
    x: 50,
    y: 526,
  },
  clampedBallPosition: {
    x: 20,
    y: 496,
  },
  clampedBallKickPosition: null,
  lastBallKickTime: 0,
  ballDirection: [1, 1],
};
