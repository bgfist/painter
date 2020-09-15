/**
 * @file 绘制圆角矩形
 * @author zuozhihheng
 */
export default function (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  radius = radius * 2 > width ? width / 2 : radius;
  radius = radius * 2 > height ? height / 2 : radius;

  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();

  return context;
}
