type ServerReadyMessage = {
  type: "server.ready";
};

type ServerAcceptPlayerMessage = {
  type: "server.acceptPlayer";
  playerId: string;
  playerIndex: number;
};

type ServerTooManyPlayersMessage = {
  type: "server.tooManyPlayers";
};

type PlayerPositionUpdate = {
  type: "playerPositionUpdate";
  position: {
    0: {
      x: number;
      y: number;
    };
    1: {
      x: number;
      y: number;
    };
  };
};

type BallPositionUpdate = {
  type: "ballPositionUpdate";
  position: {
    x: number;
    y: number;
  };
  clampedPosition: {
    x: number;
    y: number;
  };
};

type ScoreUpdate = {
  type: "scoreUpdate";
  score: {
    0: number;
    1: number;
  };
};

type GameUpdate = PlayerPositionUpdate | BallPositionUpdate | ScoreUpdate;

type ServerGameUpdateMessage = {
  type: "server.gameUpdate";
  update: GameUpdate;
};

export type ServerMessage =
  | ServerReadyMessage
  | ServerAcceptPlayerMessage
  | ServerTooManyPlayersMessage
  | ServerGameUpdateMessage;
