import { WebSocket } from "ws";

import { PlayerMessage } from "./types/playerMessages.js";
import { ServerMessage } from "./types/serverMessages.js";

export type Player = { socket: WebSocket; active: boolean; playerId: string };

type GameMessage = ServerMessage | PlayerMessage;
export { ServerMessage, PlayerMessage, GameMessage };
