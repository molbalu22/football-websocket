type CommonConfig = {
  stageSize: {
    width: number;
    height: number;
  };
  ballClampedStageSize: {
    width: number;
    height: number;
  };
  playerInitialXOffset: number;
  playerRadius: number;
  playerSpeed: number;
  ballRadius: number;
  ballKickSpeed: number;
  ballAcceleration: number;
  goalWidth: number;
  goalHeight: number;
  fps: number;
  gameDurationSec: number;
};

const STAGE_WIDTH = 1300;
const STAGE_HEIGHT = 700;

const BALL_RADIUS = 30;

export const COMMON_CONFIG: CommonConfig = {
  stageSize: {
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
  },
  ballClampedStageSize: {
    width: STAGE_WIDTH - 2 * BALL_RADIUS,
    height: STAGE_HEIGHT - 2 * BALL_RADIUS,
  },
  playerInitialXOffset: 100,
  playerRadius: 35,
  playerSpeed: 2.1,
  ballRadius: BALL_RADIUS,
  ballKickSpeed: 300.1,
  ballAcceleration: -100.03,
  goalWidth: 40,
  goalHeight: 150,
  fps: 60,
  gameDurationSec: 90,
};
