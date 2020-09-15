import { Point } from "../types";
import smoothPoints from "../algorithm/smoothPoints";

export function enableShadow(
  context: CanvasRenderingContext2D,
  offsetX: number,
  offsetY: number,
  blur: number,
  color: string
) {
  context.shadowColor = color;
  context.shadowOffsetX = offsetX;
  context.shadowOffsetY = offsetY;
  context.shadowBlur = blur;
}

export function disableShadow(context: CanvasRenderingContext2D) {
  context.shadowColor = "";
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 0;
}

/**
 * 绘图函数，当smoothedPoints不为空时会取points的最后几个点进行平滑并与smoothedPoints拼接
 * @param  points 原始数据锚点
 * @param smoothedPoints 平滑后的数据点集
 * @param  useIncrementalDraw 是否采用增量绘制
 */
export function drawPoints(
  context: CanvasRenderingContext2D,
  points: Point[],
  smoothedPoints: Point[] | null = null,
  useIncrementalDraw = true
) {
  let pointsToDraw = points;

  if (!points.length) {
    return [];
  }

  const order = 3;
  const segmentSize = Math.pow(2, order);
  const tailSize = 3;
  const sampleSize = tailSize + 1;

  if (smoothedPoints) {
    const { width, height } = context.getCanvasSize();
    const hasSmoothedBefore = !!smoothedPoints.length;

    // 平滑处理的点超出canvas则绘制到边界上
    // pointsToDraw = limitPointsInArea(
    //   pointsToDraw,
    //   {
    //     x: 0,
    //     y: 0,
    //     width: width,
    //     height: height,
    //   },
    //   // 直线就采用求两线交点的方式，某则会导致向量发生改变
    //   pointsToDraw.length < 3
    // );

    if (hasSmoothedBefore && useIncrementalDraw) {
      const tailPoints = pointsToDraw.slice(-sampleSize);
      pointsToDraw = smoothPoints(tailPoints, order).slice(-tailSize * segmentSize);
      // 移除之前末尾的部分点，因为下次的平滑会改变这些点的轨迹
      smoothedPoints = smoothedPoints.slice(0, -(tailSize - 1) * segmentSize).concat(pointsToDraw);
    } else {
      smoothedPoints = pointsToDraw = smoothPoints(pointsToDraw, order);
    }

    // offset只是一个多次尝试得出的经验值
    const offset = Math.round(segmentSize * 1.8);
    const basePoint = pointsToDraw[0];
    context.moveTo(basePoint.x, basePoint.y);

    // 每次对增量的点使用stroke方法，否则在点多时会非常耗时
    // 将新增的点分成两部分处理，否则会存在毛刺，因为新增点需要新的平滑处理，会改变末尾的线
    if (hasSmoothedBefore && useIncrementalDraw) {
      // 先绘制一部分，将其存储在缓存中
      const part1 = pointsToDraw.slice(0, -offset);
      part1.forEach((point) => {
        context.lineTo(point.x, point.y);
      });
      context.stroke();
      context.save();

      // 剩下的部分，等待下次stroke来显示
      const part2 = pointsToDraw.slice(-offset);
      context.beginPath();
      context.moveTo(part2[0].x, part2[0].y);
      part2.forEach((point) => {
        context.lineTo(point.x, point.y);
      });
    } else {
      pointsToDraw.forEach((point) => {
        context.lineTo(point.x, point.y);
      });
    }
  } else {
    const point = pointsToDraw[0];
    context.moveTo(point.x, point.y);

    pointsToDraw.forEach((point) => {
      context.lineTo(point.x, point.y);
    });
  }

  return smoothedPoints || [];
}
