/**
 * @file 桃心
 * @author wangtianhua
 */
export default {
  getOffsetX(x: number, radius: number, radian: number) {
    return x + radius * (16 * Math.pow(Math.sin(radian), 3));
  },
  getOffsetY(y: number, radius: number, radian: number) {
    return (
      y - radius * (13 * Math.cos(radian) - 5 * Math.cos(2 * radian) - 2 * Math.cos(3 * radian) - Math.cos(4 * radian))
    );
  },
};
