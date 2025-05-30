type CommonConfig = {
  stageSize: {
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

export const COMMON_CONFIG: CommonConfig = {
  stageSize: {
    width: 576,
    height: 576,
  },
  playerInitialXOffset: 50,
  playerRadius: 35,
  playerSpeed: 1.1,
  ballRadius: 30,
  ballKickSpeed: 300.1,
  ballAcceleration: -100.03,
  fps: 60,
};
