/**
 * @file 获取两点的距离
 * @author musicode
 */

export default function (startX: number, startY: number, endX: number, endY: number) {
  const dx = endX - startX,
    dy = endY - startY;

  return Math.sqrt(dx * dx + dy * dy);
}
