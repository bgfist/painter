/**
 * @file 判断点是否在矩形内
 * @author musicode
 */
import { Rect } from "../types";

export default function (rect: Rect, x: number, y: number) {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}
