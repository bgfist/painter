/**
 * @file 获取圆上的点
 * @author musicode
 */
export default function (x: number, y: number, radius: number, radian: number) {
  return {
    x: Math.floor(x + radius * Math.cos(radian)),
    y: Math.floor(y + radius * Math.sin(radian)),
  };
}
