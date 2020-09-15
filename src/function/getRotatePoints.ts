import { Point } from "../types";

/**
 * @file 旋转后的点
 * @author musicode
 */
export default function (x: number, y: number, radian: number, points: Point[]) {
  const rotatePoint = function (point: Point) {
    const deltaX = point.x - x;
    const deltaY = point.y - y;
    const sinRadian = Math.sin(radian);
    const cosRadian = Math.cos(radian);

    return {
      x: Math.floor(deltaX * cosRadian - deltaY * sinRadian + x),
      y: Math.floor(deltaX * sinRadian + deltaY * cosRadian + y),
    };
  };

  if (points instanceof Array) {
    return points.map((point) => rotatePoint(point));
  } else {
    return rotatePoint(points);
  }
}
