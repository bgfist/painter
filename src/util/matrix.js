/**
 * @file 基本矩阵变换
 * @author zuozhiheng
 */
import object from './object'

/**
 * 3x3变换矩阵 X 点坐标(x, y)
 *
 * @param {array} matrix
 * @param {array} point [x, y]
 * @returns {number[]}
 */
function multiplyMatrixAndPoint(matrix, point) {
    const c0r0 = matrix[0], c1r0 = matrix[1], c2r0 = matrix[2];
    const c0r1 = matrix[3], c1r1 = matrix[4], c2r1 = matrix[5];

    // 定义点坐标, 利用齐次坐标系，将点置为[x, y, 1]
    const x = point[0];
    const y = point[1];

    return [
        Math.round(c0r0 * x + c1r0 * y + c2r0),
        Math.round(c0r1 * x + c1r1 * y + c2r1)
    ];
}

/**
 * 两个 3X3的矩阵相乘
 *
 * @param {array} a
 * @param {array} b
 * @returns {*[]}
 */
function multiplyMatrixs(a, b) {
    let a00 = a[0], a01 = a[1], a02 = a[2];
    let a10 = a[3], a11 = a[4], a12 = a[5];
    let a20 = a[6], a21 = a[7], a22 = a[8];
    let b00 = b[0], b01 = b[1], b02 = b[2];
    let b10 = b[3], b11 = b[4], b12 = b[5];
    let b20 = b[6], b21 = b[7], b22 = b[8];

    return [
        b00 * a00 + b01 * a10 + b02 * a20,
        b00 * a01 + b01 * a11 + b02 * a21,
        b00 * a02 + b01 * a12 + b02 * a22,
        b10 * a00 + b11 * a10 + b12 * a20,
        b10 * a01 + b11 * a11 + b12 * a21,
        b10 * a02 + b11 * a12 + b12 * a22,
        b20 * a00 + b21 * a10 + b22 * a20,
        b20 * a01 + b21 * a11 + b22 * a21,
        b20 * a02 + b21 * a12 + b22 * a22
    ];
}

/**
 * 对坐标点进行矩阵变换
 *
 * @param {array} point [x, y]
 * @param {Object} options
 * @property {array} option.translate [x, y]
 * @property {array} option.scale [x, y]
 * @property {array} option.rotate 弧度
 */
function transform(point, options) {
    let matrix = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ];

    object.each(
        options,
        (option, key) => {
            let transformMatrix;
            switch (key) {
                case 'translate':
                    transformMatrix = [
                        1, 0, option[0],
                        0, 1, option[1],
                        0, 0, 1
                    ];
                    break;

                case 'scale':
                    transformMatrix = [
                        option[0], 0, 0,
                        0, option[1], 0,
                        0, 0, 1
                    ];
                    break;

                case 'rotate':
                    transformMatrix = [
                        Math.cos(option), Math.sin(option), 0,
                        -Math.sin(option), Math.cos(option), 0,
                        0, 0, 1
                    ];
                    break;
            }
            transformMatrix && (matrix = multiplyMatrixs(matrix, transformMatrix));
        }
    );

    return multiplyMatrixAndPoint(matrix, point);
}

export default {
    transform
}
