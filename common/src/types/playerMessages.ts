type PlayerJoinGameMessage = {
  type: "player.joinGame";
  playerId: string | null;
};

type PlayerKeyboardInputMessage = {
  type: "player.keyboardInput";
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
};

type PlayerMouseMoveMessage = {
  type: "player.mouseMove";
  mouseX: number;
  mouseY: number;
};

export type PlayerMessage =
  | PlayerJoinGameMessage
  | PlayerKeyboardInputMessage
  | PlayerMouseMoveMessage;
