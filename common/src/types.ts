import { WebSocket } from "ws";

import { PlayerMessage } from "./types/playerMessages.js";
import { ServerMessage } from "./types/serverMessages.js";

export type Player = {
  socket: WebSocket;
  active: boolean;
  playerId: string;
  playerIndex: number;
};

type GameMessage = ServerMessage | PlayerMessage;
export { ServerMessage, PlayerMessage, GameMessage };
