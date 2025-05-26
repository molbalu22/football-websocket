type CommonConfig = {
  stageSize: {
    width: number;
    height: number;
  };
  playerInitialXOffset: number;
  playerRadius: number;
};

export const COMMON_CONFIG: CommonConfig = {
  stageSize: {
    width: 576,
    height: 576,
  },
  playerInitialXOffset: 50,
  playerRadius: 35,
};
