import { COMMON_CONFIG } from "../common/config";
import type { GameCanvas, GameStage } from "./GameCanvas";

// Consider:
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
// https://developer.mozilla.org/en-US/docs/Web/API/Node/isEqualNode
// https://developer.mozilla.org/en-US/docs/Web/API/Node/isSameNode
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality
// https://stackoverflow.com/questions/7238586/do-i-need-to-be-concerned-with-race-conditions-with-asynchronous-javascript/7238663#7238663

type GameStageErrorType =
  | "NULL_CANVAS"
  | "CANVAS_TYPE_ERROR"
  | "GET_2D_CTX_ERROR";

export class GameStageError {
  errorType: GameStageErrorType;
  errorMsg: string;

  constructor(errorType: GameStageErrorType) {
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

export function getGameStage(): GameStage | GameStageError {
  const stage = document.getElementById("stage");
  const cursorCanvas = document.getElementById("cursorCanvas");
  const opponentCursorCanvas = document.getElementById("opponentCursorCanvas");
  const figureCanvas = document.getElementById("figureCanvas");

  if (!(stage && cursorCanvas && opponentCursorCanvas && figureCanvas)) {
    return new GameStageError("NULL_CANVAS");
  }

  if (
    !(
      cursorCanvas instanceof HTMLCanvasElement &&
      opponentCursorCanvas instanceof HTMLCanvasElement &&
      figureCanvas instanceof HTMLCanvasElement
    )
  ) {
    return new GameStageError("CANVAS_TYPE_ERROR");
  }

  stage.style.width = `${COMMON_CONFIG.stageSize.width}px`;
  stage.style.height = `${COMMON_CONFIG.stageSize.height}px`;

  cursorCanvas.width = COMMON_CONFIG.stageSize.width;
  cursorCanvas.height = COMMON_CONFIG.stageSize.height;
  opponentCursorCanvas.width = COMMON_CONFIG.stageSize.width;
  opponentCursorCanvas.height = COMMON_CONFIG.stageSize.height;
  figureCanvas.width = COMMON_CONFIG.stageSize.width;
  figureCanvas.height = COMMON_CONFIG.stageSize.height;

  if (cursorCanvas.getContext) {
    const cursorCtx = cursorCanvas.getContext("2d");
    const opponentCursorCtx = opponentCursorCanvas.getContext("2d");
    const figureCtx = figureCanvas.getContext("2d");

    if (!(cursorCtx && opponentCursorCtx && figureCtx)) {
      return new GameStageError("GET_2D_CTX_ERROR");
    }

    return {
      cursorCanvas: {
        canvasElement: cursorCanvas,
        ctx: cursorCtx,
      },
      opponentCursorCanvas: {
        canvasElement: opponentCursorCanvas,
        ctx: opponentCursorCtx,
      },
      figureCanvas: {
        canvasElement: figureCanvas,
        ctx: figureCtx,
      },
    };
  }

  return new GameStageError("GET_2D_CTX_ERROR");
}

export function clearCanvas(gameCanvas: GameCanvas) {
  const { canvasElement, ctx } = gameCanvas;

  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
}
