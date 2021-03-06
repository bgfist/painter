/**
 * @file 箭头
 * @author musicode
 */

import Polygon from "./Polygon";

import getDistance from "../function/getDistance";
import getPointOfCircle from "../function/getPointOfCircle";
import getRotatePoints from "../function/getRotatePoints";
import { Painter } from "../Painter";

const RADIANS = Math.PI / 180;

/**
 * points 点数组
 * thickness 箭头粗细
 */
export default class Arrow extends Polygon {
  /**
   * 正在绘制
   *
   * @param {Painter} painter
   * @param {number} startX 起始点 x 坐标
   * @param {number} startY 起始点 y 坐标
   * @param {number} endX 结束点 x 坐标
   * @param {number} endY 结束点 y 坐标
   * @param {Function} restore 还原为鼠标按下时的画布
   */
  drawing(painter: Painter, startX, startY, endX, endY, restore) {
    restore();
    object.extend(this, Arrow.draw(startX, startY, endX, endY, this.thickness, this.double));
    this.draw(painter);
  }

  toJSON() {
    return super.toJSON({
      name: "Polygon",
    });
  }
}

Arrow.draw = function (startX, startY, endX, endY, thickness, double) {
  const distance = getDistance(startX, startY, endX, endY);

  // 下面这些数字都是不断尝试调出的参数，没有理由，就是试
  let threshold = thickness * 20,
    header;

  if (distance < threshold) {
    thickness *= distance / threshold;
    header = distance / 3;
  } else {
    header = distance / 8;
    if (header > thickness * 8) {
      header = thickness * 8;
    }
  }

  const points = [];
  const arrowRadians = 70;
  const arrowRadius = 0.5 * header;
  const arrowDistance = Math.cos(arrowRadians * RADIANS) * arrowRadius;

  let drawSingleArrow = function (point) {
    array.push(points, point);
    point = {
      x: point.x + distance - header,
      y: point.y,
    };
    if (double) {
      point.x -= header;
    }
    array.push(points, point);
    array.push(points, getPointOfCircle(point.x, point.y, arrowRadius, (180 + arrowRadians) * RADIANS));
    array.push(points, {
      x: startX + distance,
      y: startY,
    });
  };

  if (double) {
    array.push(points, {
      x: startX,
      y: startY,
    });
    let point = {
      x: startX + header,
      y: startY - thickness,
    };
    array.push(points, getPointOfCircle(point.x, point.y, arrowRadius, (360 - arrowRadians) * RADIANS));
    drawSingleArrow(point);
  } else {
    drawSingleArrow({
      x: startX,
      y: startY - thickness,
    });
  }

  for (let i = points.length - 2; i >= 0; i--) {
    points.push({
      x: points[i].x,
      y: 2 * startY - points[i].y,
    });
  }

  return {
    points: getRotatePoints(startX, startY, Math.atan2(endY - startY, endX - startX), points),
  };
};
