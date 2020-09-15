/**
 * @file 转换图形尺寸
 * @author musicode
 */

import { Shape } from "../Shape";

export default function (shapes: Shape[], oldWidth: number, oldHeight: number, newWidth: number, newHeight: number) {
  const widthRatio = newWidth / oldWidth;
  const heightRatio = newHeight / oldHeight;

  if (widthRatio !== 1 || heightRatio !== 1) {
    shapes.forEach(function (shape) {
      if (shape) {
        if (widthRatio !== 1) {
          if (shape.x) {
            shape.x *= widthRatio;
          }
          if (shape.width) {
            shape.width *= widthRatio;
          }
          if (shape.fontSize) {
            shape.fontSize *= widthRatio;
          }
        }
        if (heightRatio !== 1) {
          if (shape.y) {
            shape.y *= heightRatio;
          }
          if (shape.height) {
            shape.height *= heightRatio;
          }
        }
        if (shape.points) {
          shape.points.forEach(function (point) {
            if (point.x) {
              point.x *= widthRatio;
            }
            if (point.y) {
              point.y *= heightRatio;
            }
          });
        }
      }
    });
  }
}
