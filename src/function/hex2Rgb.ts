/**
 * @file 将16进制表示的颜色转为rgb
 * @author zuozhiheng
 */

/**
 * @param {string} hexColor
 * @param {?number} alpha 透明度
 * @return {string}
 */
export default function (hexColor: string, alpha: number) {
  const hexColorPattern = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

  if (hexColorPattern.test(hexColor)) {
    hexColor = hexColor.slice(1);
    alpha = alpha >= 0 && alpha <= 1 ? alpha : 1;

    let delta = hexColor.length / 3;
    let rgbString = [hexColor.slice(0, delta), hexColor.slice(delta, delta * 2), hexColor.slice(delta * 2)]
      .map((hexString) => parseInt(hexString.length === 1 ? hexString + hexString : hexString, 16))
      .join(", ");

    return alpha === 1 ? `rgb(${rgbString})` : `rgba(${rgbString} ,${alpha})`;
  }

  return hexColor;
}
