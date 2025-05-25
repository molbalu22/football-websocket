import type { GameCanvas } from "../canvas/GameCanvas";
import type { Prettify } from "../common/types/util";

export type GameState = Prettify<
  {
    playerIndex: number;
  } & GameCanvas
>;
