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

const PLAYER_RADIUS = 35;

export const COMMON_CONFIG: CommonConfig = {
  stageSize: {
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
  },
  ballClampedStageSize: {
    width: STAGE_WIDTH - 2 * PLAYER_RADIUS,
    height: STAGE_HEIGHT - 2 * PLAYER_RADIUS,
  },
  playerInitialXOffset: 50,
  playerRadius: PLAYER_RADIUS,
  playerSpeed: 1.1,
  ballRadius: 30,
  ballKickSpeed: 600.1,
  ballAcceleration: -100.03,
  fps: 60,
};
