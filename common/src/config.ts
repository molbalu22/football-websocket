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
  fps: number;
};

const STAGE_WIDTH = 576;
const STAGE_HEIGHT = 576;

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
  playerInitialXOffset: 50,
  playerRadius: 35,
  playerSpeed: 1.1,
  ballRadius: BALL_RADIUS,
  ballKickSpeed: 600.1,
  ballAcceleration: -100.03,
  fps: 60,
};
