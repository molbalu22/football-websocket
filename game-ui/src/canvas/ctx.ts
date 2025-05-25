import type { GameCanvas } from "./GameCanvas";

// Consider:
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
// https://developer.mozilla.org/en-US/docs/Web/API/Node/isEqualNode
// https://developer.mozilla.org/en-US/docs/Web/API/Node/isSameNode
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality
// https://stackoverflow.com/questions/7238586/do-i-need-to-be-concerned-with-race-conditions-with-asynchronous-javascript/7238663#7238663

type GameCanvasErrorType =
  | "NULL_CANVAS"
  | "CANVAS_TYPE_ERROR"
  | "GET_2D_CTX_ERROR";

export class GameCanvasError {
  errorType: GameCanvasErrorType;
  errorMsg: string;

  constructor(errorType: GameCanvasErrorType) {
    this.errorType = errorType;

    switch (errorType) {
      case "NULL_CANVAS":
        this.errorMsg = "Game canvas is null";
        break;
      case "CANVAS_TYPE_ERROR":
        this.errorMsg = "Game canvas element is not actually a canvas";
        break;
      case "GET_2D_CTX_ERROR":
        this.errorMsg = "Can't get a 2D canvas context";
        break;
      default:
        const exhaustiveCheck: never = errorType;
        throw new Error(`Unhandled errorType: ${exhaustiveCheck}`);
    }
  }
}

export function getGameCanvas(): GameCanvas | GameCanvasError {
  const gameCanvas = document.getElementById("gameCanvas");

  if (!gameCanvas) {
    return new GameCanvasError("NULL_CANVAS");
  }

  if (!(gameCanvas instanceof HTMLCanvasElement)) {
    return new GameCanvasError("CANVAS_TYPE_ERROR");
  }

  // Get the bounding rectangle of the game canvas
  const rect = gameCanvas.getBoundingClientRect();

  // Set the width and height attributes to the CSS width and height
  gameCanvas.width = rect.width;
  gameCanvas.height = rect.height;

  if (gameCanvas.getContext) {
    const ctx = gameCanvas.getContext("2d");

    if (!ctx) {
      return new GameCanvasError("GET_2D_CTX_ERROR");
    }

    return {
      canvasElement: gameCanvas,
      canvasCtx: ctx,
    };
  }

  return new GameCanvasError("GET_2D_CTX_ERROR");
}

export function clearCanvas(gameCanvas: GameCanvas) {
  const { canvasElement, canvasCtx } = gameCanvas;

  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
}
