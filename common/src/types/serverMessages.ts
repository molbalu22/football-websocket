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

type SquareColorUpdate = {
  type: "squareColorUpdate";
  playerIndex: number;
  color: "red" | "green" | "blue";
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

type GameUpdate = SquareColorUpdate | PlayerPositionUpdate;

type ServerGameUpdateMessage = {
  type: "server.gameUpdate";
  update: GameUpdate;
};

export type ServerMessage =
  | ServerReadyMessage
  | ServerAcceptPlayerMessage
  | ServerTooManyPlayersMessage
  | ServerGameUpdateMessage;
