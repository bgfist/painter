import { Rect } from "../types";

/**
 * @file 多个矩形的并集
 * @author musicode
 */
export default function (startX: number, startY: number, endX: number, endY: number): Rect {
  let x, y, width, height;

  if (startX < endX) {
    x = startX;
    width = endX - startX;
  } else {
    x = endX;
    width = startX - endX;
  }

  if (startY < endY) {
    y = startY;
    height = endY - startY;
  } else {
    y = endY;
    height = startY - endY;
  }

  return { x, y, width, height };
}
