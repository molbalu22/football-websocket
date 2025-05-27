import type { Player, CommonGameState } from "./types/game.js";
import { InitialCommonGameState } from "./types/game.js";
import type { PlayerMessage } from "./types/playerMessages.js";
import type { ServerMessage } from "./types/serverMessages.js";

export type { Player, CommonGameState };
export { InitialCommonGameState };

type GameMessage = ServerMessage | PlayerMessage;
export type { ServerMessage, PlayerMessage, GameMessage };
