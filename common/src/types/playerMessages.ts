type PlayerJoinGameMessage = {
  type: "player.joinGame";
  playerId: string | null;
};

export type PlayerMessage = PlayerJoinGameMessage;
