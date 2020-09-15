import xs from "xstream";
import { Size } from "./types";

function clearCanvas(context: CanvasRenderingContext2D) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

export function defaultCacheOptions(): PainterCacheOptions {
  // 离屏缓存画布，用于画布的save与restore
  const cacheContext = document.createElement("canvas").getContext("2d")!;

  function cacheDraw(context: CanvasRenderingContext2D) {
    clearCanvas(cacheContext);
    cacheContext.drawImage(context.canvas, 0, 0);
  }

  function restoreDraw(context: CanvasRenderingContext2D) {
    context.drawImage(cacheContext.canvas, 0, 0);
  }

  return {
    cacheDraw,
    restoreDraw,
  };
}

export function Painter({
  canvas,
  cacheOptions,
}: {
  canvas: HTMLCanvasElement;
  size$: xs<Size>;
  cacheOptions?: PainterCacheOptions;
}) {
  const context = canvas.getContext("2d")!;

  return {
    cacheDraw() {
      cacheOptions?.cacheDraw(context, canvas);
    },
    restoreDraw() {
      cacheOptions?.restoreDraw(context, canvas);
    },
    clear() {
      clearCanvas(context);
    },
    enableShadow(offsetX: number, offsetY: number, blur: number, color: string) {
      context.shadowColor = color;
      context.shadowOffsetX = offsetX;
      context.shadowOffsetY = offsetY;
      context.shadowBlur = blur;
    },
    disableShadow() {
      context.shadowColor = "";
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
      context.shadowBlur = 0;
    },
    setLineWidth(width: number) {
      context.lineWidth = width;
    },
    setLineDash(segments: number[]) {
      context.setLineDash(segments);
    },
    setStrokeStyle(color: string) {
      context.strokeStyle = color;
    },
    setFillStyle(color: string) {
      context.fillStyle = color;
    },
    beginPath() {
      context.beginPath();
    },
    closePath() {
      context.closePath();
    },
    rect(x: number, y: number, w: number, h: number) {
      context.rect(x, y, w, h);
    },
    stroke() {
      context.stroke();
    },
    fill() {
      context.fill();
    },
    moveTo(x: number, y: number) {
      context.moveTo(x, y);
    },
    lineTo(x: number, y: number) {
      context.lineTo(x, y);
    },
  };
}

export interface PainterCacheOptions {
  cacheDraw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void;
  restoreDraw(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void;
}

export type Painter = ReturnType<typeof Painter>;
