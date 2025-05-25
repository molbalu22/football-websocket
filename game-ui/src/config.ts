export type GameConfig = {
  DEBUG: boolean;
  TRACE: boolean;
  WEBSOCKET_URL: string;
};

export const CONFIG: GameConfig = {
  DEBUG: true,
  TRACE: true,
  WEBSOCKET_URL: "http://localhost:8080",
};
