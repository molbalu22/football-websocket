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

export type ServerMessage =
  | ServerReadyMessage
  | ServerAcceptPlayerMessage
  | ServerTooManyPlayersMessage;
