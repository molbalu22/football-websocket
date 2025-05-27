type CommonConfig = {
  stageSize: {
    width: number;
    height: number;
  };
  playerInitialXOffset: number;
  playerRadius: number;
  playerSpeed: number;
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
  fps: 60,
};
