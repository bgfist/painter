/**
 * @file 图形基类
 * @author musicode
 */
import containLine from "../contain/line";
import containRect from "../contain/rect";
import getRectByPoints from "../function/getRectByPoints";
import getRotatePoints from "../function/getRotatePoints";
import { Config } from "../types";

/**
 * 图形是点的集合
 * 因此图形基类默认通过 points 进行绘制
 * 对于特殊图形，可通过子类改写某些方法实现
 */

function isValidStyle(style) {
  return style && style !== "transparent";
}

export default class Shape {
  constructor(props: Config) {
    object.extend(this, props);

    this.fillAlpha = this.fillStyle === "transparent" ? 0 : this.fillAlpha || 1;
    this.strokeAlpha = this.strokeStyle === "transparent" ? 0 : this.strokeAlpha || 1;
  }

  /**
   * 点是否位于图形范围内
   *
   * @param {Painter} painter
   * @param {number} x
   * @param {number} y
   * @return {boolean}
   */
  isPointInPath(x, y) {
    let rect = this.getRect(painter);

    if (!rect.width) {
      rect.x -= constant.SIZE_MIN / 2;
      rect.width = constant.SIZE_MIN;
    }

    if (!rect.height) {
      rect.y -= constant.SIZE_MIN / 2;
      rect.height = constant.SIZE_MIN;
    }

    if (containRect(rect, x, y)) {
      if (isValidStyle(this.fillStyle) && this.isPointInFill) {
        return this.isPointInFill(painter, x, y);
      }
      return this.isPointInStroke(painter, x, y);
    }

    return false;
  }

  isPointInStroke(painter, x, y) {
    let { lineWidth, points } = this;
    if (lineWidth < constant.SIZE_MIN) {
      lineWidth = constant.SIZE_MIN;
    }

    let isPathClosed = this.isPathClosed && this.isPathClosed();
    for (let i = 0, nextPoint, len = points.length; i < len; i++) {
      nextPoint = points[i + 1] || (isPathClosed && points[0]);
      if (
        nextPoint &&
        containLine(points[i].x, points[i].y, nextPoint.x, nextPoint.y, lineWidth * constant.DEVICE_PIXEL_RATIO, x, y)
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * 绘制图形
   *
   * @param {Painter} painter
   */
  draw(painter) {
    const needFill = this.fill && isValidStyle(this.fillStyle);
    const needStroke = this.lineWidth && isValidStyle(this.strokeStyle);

    painter.saveContext();

    if (this.rotate) {
      // 被动触发方只能每次自行计算旋转中心并且其永远保持在图形中心，故放在此处
      const rect = this.getRect(painter);
      this.rotateOrigin = [rect.x + rect.width / 2, rect.y + rect.height / 2];
      painter.rotate(this.rotate, this.rotateOrigin);
    }

    if (needFill) {
      !needStroke && this.applyShadow(painter);
      this.fill(painter);
    }

    if (needStroke) {
      this.applyShadow(painter);
      this.setLineStyle(painter);
      this.stroke(painter);
    }

    painter.restoreContext();
  }

  /**
   * 绘制路径
   *
   * @param {Painter} painter
   */
  drawPath(painter) {
    painter.drawPoints(this.points);
  }

  /**
   * 描边
   *
   * @param {Painter} painter
   */
  stroke(painter) {
    painter.setLineWidth(this.lineWidth * constant.DEVICE_PIXEL_RATIO);
    painter.setLineDash(this.lineDash);
    painter.setStrokeStyle(this.strokeStyle, this.strokeAlpha);
    painter.begin();
    this.drawPath(painter);
    painter.stroke();
  }

  applyShadow(painter) {
    if (this.shadowColor) {
      painter.enableShadow(this.shadowOffsetX, this.shadowOffsetY, this.shadowBlur, this.shadowColor);
    } else {
      painter.disableShadow();
    }
  }

  setLineStyle(painter) {}

  save(rect) {
    return this.points.map(function (point) {
      return {
        x: (point.x - rect.x) / (rect.width || 1),
        y: (point.y - rect.y) / (rect.height || 1),
      };
    });
  }

  restore(rect, data) {
    array.each(this.points, function (point, i) {
      point.x = rect.x + rect.width * data[i].x;
      point.y = rect.y + rect.height * data[i].y;
    });
  }

  getRect() {
    return getRectByPoints(this.points);
  }

  // 获取外切矩形
  getOuterRect(painter) {
    if (this.rotate) {
      const points = this.points.map((point) => {
        return getRotatePoints(this.rotateOrigin[0], this.rotateOrigin[1], this.rotate, point);
      });
      return getRectByPoints(points);
    } else {
      return this.getRect(painter);
    }
  }

  clone() {
    return new this.constructor(object.copy(this, true));
  }

  toJSON(extra) {
    let json = {
      number: this.number,
      lineWidth: this.lineWidth,
      strokeStyle: this.strokeStyle,
      strokeAlpha: this.strokeAlpha,
      fillStyle: this.fillStyle,
      fillAlpha: this.fillAlpha,
      rotate: this.rotate,
    };
    if (this.points) {
      json.points = this.points;
    }
    if (extra) {
      object.extend(json, extra);
    }
    return json;
  }
}
