import type { GameStage } from "../canvas/GameCanvas";
import type { CommonGameState } from "../common/types";
import type { Prettify } from "../common/types/util";

export type GameState = Prettify<
  {
    socket: WebSocket | null;
    isPlayerAccepted: boolean;
    playerIndex: number;
    darkTheme: boolean;
  } & GameStage &
    CommonGameState
>;
