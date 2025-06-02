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
  gameEnded: boolean;

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

  score: {
    0: number;
    1: number;
  };

  isBallInGoal: boolean;

  gameStartTime: number;
};

const { ballRadius, stageSize, ballClampedStageSize, playerInitialXOffset } =
  COMMON_CONFIG;

const CLAMPED_BALL_POSITION = {
  x: ballClampedStageSize.width / 2,
  y: ballClampedStageSize.height / 2,
};

export function InitialCommonGameState(): CommonGameState {
  return {
    isGameRunning: false,
    gameEnded: false,
    playerPosition: {
      0: {
        x: playerInitialXOffset,
        y: stageSize.height / 2,
      },
      1: {
        x: stageSize.width - playerInitialXOffset,
        y: stageSize.height / 2,
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
      x: CLAMPED_BALL_POSITION.x + ballRadius,
      y: CLAMPED_BALL_POSITION.y + ballRadius,
    },
    clampedBallPosition: CLAMPED_BALL_POSITION,
    clampedBallKickPosition: null,
    lastBallKickTime: 0,
    ballDirection: [0, 0],
    score: {
      0: 0,
      1: 0,
    },
    isBallInGoal: false,
    gameStartTime: 0,
  };
}
