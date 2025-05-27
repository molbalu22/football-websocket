import { CommonGameState, Player } from "../common/types.js";
import { Prettify } from "../common/types/util.js";

export type ServerGameState = Prettify<
  {
    players: Array<Player>;
  } & CommonGameState
>;
