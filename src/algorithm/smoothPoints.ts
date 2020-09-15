/**
 * @file 涂鸦平滑算法
 * @description 简单来说
 * 1、两两取中点来把所有点数翻倍得到点集合
 * 2、然后将新点继续两两取中点并抛弃之前的点(不包括首尾)得到新的点集合
 * 3、重复步骤2
 * 4、输出
 * @author dujianhao
 * @date 2018/12/13
 */

import { Point } from "../types";

/**
 * Recursion to get smoothed points
 * @param points points to be smoothed
 * @param order Recursion time
 */
const bspline = function (points: Point[], order: number): Point[] {
  if (!order) {
    return points;
  }
  return bspline(_dual(_dual(_refine(points))), order - 1);
};

const _refine = function (points: Point[]) {
  points = [points[0]].concat(points).concat(last(points));
  const refined = [];

  let index = 0;
  for (const point of points) {
    refined[index * 2] = point;
    if (points[index + 1]) {
      refined[index * 2 + 1] = _mid(point, points[index + 1]);
    }
    index += 1;
  }

  return refined;
};

const _dual = function (points: Point[]) {
  const dualed = [];

  let index = 0;
  for (const point of points) {
    if (points[index + 1]) {
      dualed[index] = _mid(point, points[index + 1]);
    }
    index += 1;
  }

  return dualed;
};

const _mid = function (a: Point, b: Point) {
  return {
    x: a.x + (b.x - a.x) / 2,
    y: a.y + (b.y - a.y) / 2,
  };
};

function last(array: Point[], n?: number) {
  if (n) {
    return Array.prototype.slice.call(array, Math.max(array.length - n, 0));
  } else {
    return array[array.length - 1];
  }
}

export default function (points: Point[], order = 3) {
  return bspline(points, order);
}
