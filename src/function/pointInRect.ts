import { Point, Rect } from "../types";

export default function (point: Point, rect: Rect) {
  const left = rect.x;
  const right = rect.x + rect.width;
  const top = rect.y;
  const bottom = rect.y + rect.height;

  return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
}
