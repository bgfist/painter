/**
 * @file 抄来的...
 * @author musicode
 */
export default function (x0: number, y0: number, x1: number, y1: number, x: number, y: number) {
  if ((y > y0 && y > y1) || (y < y0 && y < y1)) {
    return 0;
  }
  // Ignore horizontal line
  if (y1 === y0) {
    return 0;
  }
  let dir = y1 < y0 ? 1 : -1;
  let t = (y - y0) / (y1 - y0);

  // Avoid winding error when intersection point is the connect point of two line of polygon
  if (t === 1 || t === 0) {
    dir = y1 < y0 ? 0.5 : -0.5;
  }

  let x_ = t * (x1 - x0) + x0;

  return x_ > x ? dir : 0;
}
