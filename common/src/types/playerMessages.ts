type PlayerJoinGameMessage = {
  type: "player.joinGame";
  playerId: string | null;
};

type PlayerMouseMoveMessage = {
  type: "player.mouseMove";
  mouseX: number;
  mouseY: number;
};

export type PlayerMessage = PlayerJoinGameMessage | PlayerMouseMoveMessage;
