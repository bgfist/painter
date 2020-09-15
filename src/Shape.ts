import xs from "xstream";
import { Painter } from "./Painter";
import { Config, MouseStream, Point, Rect } from "./types";
import { curry } from "./utils/curry";
import containLine from "./contain/line";
import getRectByPoints from "./function/getRectByPoints";
import flattenAll from "./utils/flattenAll";

function drawPoints(points: Point[], painter: Painter) {
  const [point, ...others] = points;
  painter.beginPath();
  painter.moveTo(point.x, point.y);
  others.forEach((point) => painter.lineTo(point.x, point.y));
  painter.stroke();
}

function Shape(config: Config, points: Point[]) {
  return {
    draw: curry(drawPoints, points),
    isPointInPath({ x, y }: Point) {
      for (let i = 0, nextPoint, len = points.length; i < len; i++) {
        nextPoint = points[i + 1];
        if (
          nextPoint &&
          containLine(points[i].x, points[i].y, nextPoint.x, nextPoint.y, 1 * config.devicePixelRatio, x, y)
        ) {
          return true;
        }
      }
      return false;
    },
    getOuterRect() {
      return this.getRect();
    },
    getRect() {
      return getRectByPoints(points);
    },
  };
}

export function ShapeCtor({ painter, mouseStream: { mouseDown$, mouseMove$, mouseUp$ }, config }: ShapeCtorOptions) {
  const { points$, shape$ } = mouseDown$
    .map((p) => {
      const points$ = mouseMove$.endWhen(mouseUp$).fold<Point[]>((acc, p) => [...acc, p], [p]);
      const shape$ = points$.last().map((points) => Shape(config, points));
      return {
        points$,
        shape$,
      };
    })
    .compose(flattenAll("points$", "shape$"));

  const drawShape$ = points$.map((points) => curry(drawPoints, points, painter));

  return {
    shape$,
    drawShape$,
  };
}

export interface ShapeCtorOptions {
  painter: Painter;
  mouseStream: MouseStream;
  config: Config;
}

export interface ShapeCtor {
  (options: ShapeCtorOptions): {
    shape$: xs<Shape>;
    drawShape$: xs<() => void>;
  };
}

export interface Shape {
  id: number;
  draw(painter: Painter): void;
  isPointInPath(p: Point): boolean;
  getRect(): Rect;
  getOuterRect(): Rect;
  save(rect: Rect): void;
  restore(rect: Rect, data: Rect): void;
}
