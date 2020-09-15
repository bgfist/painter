/**
 * @file 获取两直线的交点
 * @author zuozhiheng
 */
function generalEquation(point1, point2) {
    // 直线方程的一般形式 Ax + By + C = 0;
    const A = point2.y - point1.y;
    const B = point1.x - point2.x;
    const C = point2.x * point1.y - point1.x * point2.y;
    return {A, B, C}
}

function getIntersectPointOfLines(point1, point2, point3, point4) {
    // 设两条直线分别为 A1x + B1y + C1 = 0 和 A2x + B2y + C2 = 0
    // 则交点 x = (C2B1 - C1B2) / (A1B2 - A2B1)  y = (C1A2 - C2A1) / (A1B2 - A2B1)
    const equationOfLine1 = generalEquation(point1, point2);
    const equationOfLine2 = generalEquation(point3, point4);
    const m = equationOfLine1.A * equationOfLine2.B - equationOfLine2.A * equationOfLine1.B;

    if (m) {
        return {
            x: Math.round((equationOfLine2.C * equationOfLine1.B - equationOfLine1.C * equationOfLine2.B) / m),
            y: Math.round((equationOfLine1.C * equationOfLine2.A - equationOfLine2.C * equationOfLine1.A) / m)
        };
    }
    else {
        return null;
    }
}

export default {
    generalEquation,
    getIntersectPointOfLines
}