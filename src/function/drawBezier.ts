/**
 * @file 绘制贝塞尔曲线
 * @param context 绘图ctx
 * @param points 点集合
 * @author dujianhao
 * @date 2018/12/7
 */

import { Point } from "../types";

export default function (context: CanvasRenderingContext2D, points: Point[]) {
  const len = points.length;

  if (len < 2) {
    return;
  }

  //起始点不参与bezier算法
  context.moveTo(points[0].x, points[0].y);

  context.lineTo(points[1].x, points[1].y);

  for (let i = 1; i < len - 2; i++) {
    // 计算贝塞尔曲线控制点
    const k = 1 / 4; // 令起始点斜率与结束点同为1 / 4

    // 起始点
    const startPoint = points[i];
    // 起始点前一点
    const lastPoint = points[i - 1];

    // 当前点
    const currentPoint = points[i + 1];
    // 结束点下一点
    const nextPoint = points[i + 2];

    const controlPointA = {
      x: startPoint.x + (currentPoint.x - lastPoint.x) * k,
      y: startPoint.y + (currentPoint.y - lastPoint.y) * k,
    };

    const controlPointB = {
      x: currentPoint.x - (nextPoint.x - startPoint.x) * k,
      y: currentPoint.y - (nextPoint.y - startPoint.y) * k,
    };

    context.bezierCurveTo(
      controlPointA.x,
      controlPointA.y,
      controlPointB.x,
      controlPointB.y,
      currentPoint.x,
      currentPoint.y
    );
  }

  //截止点不参与bezier算法
  context.lineTo(points[len - 1].x, points[len - 1].y);
}
