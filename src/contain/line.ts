/**
 * @file 判断点是否在线段内
 * @author musicode
 */
export default function (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  lineWidth: number,
  x: number,
  y: number
) {
  if (!lineWidth) {
    return false;
  }

  let halfWidth = lineWidth / 2;

  if (
    (x > startX + halfWidth && x > endX + halfWidth) ||
    (x < startX - halfWidth && x < endX - halfWidth) ||
    (y > startY + halfWidth && y > endY + halfWidth) ||
    (y < startY - halfWidth && y < endY - halfWidth)
  ) {
    return false;
  }

  // 直线方程
  //
  // 点斜式  y = kx + b
  // 适用范围：直线不垂直于 x 轴
  //
  // 因此先排除直线垂直于 x 轴的情况
  if (startX === endX) {
    return Math.abs(x - startX) <= halfWidth;
  }

  // 求出公式 y = kx + b 中的 k 和 b
  let k = (endY - startY) / (endX - startX);
  let b = (startX * endY - endX * startY) / (startX - endX);

  // 然后运用点到直线距离公式
  // s 表示点到直线距离的平方
  let s = Math.pow(k * x - y + b, 2) / (k * k + 1);

  // 点到直线的距离应该 <= lineWidth / 2
  return s <= Math.pow(halfWidth, 2);
}
