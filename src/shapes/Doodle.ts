/**
 * @file 涂鸦
 * @author musicode
 */

import Shape from './Shape'
import constant from '../constant'

/**
 * points 点数组
 */
export default class Doodle extends Shape {

    setLineStyle(painter) {
        const isMarker = this.strokeAlpha !== 1;
        painter.setLineJoin(isMarker ? 'miter' : 'round')
        painter.setLineCap(isMarker ? 'square' : 'round')
    }

    /**
     * 正在绘制
     *
     * @param {Painter} painter
     * @param {number} startX 起始点 x 坐标
     * @param {number} startY 起始点 y 坐标
     * @param {number} endX 结束点 x 坐标
     * @param {number} endY 结束点 y 坐标
     * @param {Function} restore 还原为鼠标按下时的画布
     */
    drawing(painter, startX, startY, endX, endY, restore) {

        restore()


        !this.points && (this.points = [{
            x: startX,
            y: startY
        }])

        painter.disableShadow()
        painter.begin()

        this.setLineStyle(painter)
        painter.setLineWidth(this.lineWidth * constant.DEVICE_PIXEL_RATIO)
        painter.setLineDash(this.lineDash)
        painter.setStrokeStyle(this.strokeStyle, this.strokeAlpha)

        this.points.push({
            x: endX,
            y: endY
        });

        // smoothedPoints用于告诉painter上次平滑的结果，使得painter可以只对最新加的点平滑
        this.smoothedPoints = painter.drawPoints(
            this.points,
            this.smoothedPoints || [],
            // 透明的画笔不能采用增量绘制，会有重复的部分导致颜色不均
            this.strokeAlpha === 1
        )
        painter.stroke()
    }

    /**
     * 绘制路径
     *
     * @param {Painter} painter
     */
    drawPath(painter) {
        painter.drawPoints(
            this.points,
            [],
            this.strokeAlpha === 1
        )
    }

    toJSON() {
        return super.toJSON({
            name: 'Doodle',
        })
    }

    /**
     * 绘制结束，清空smoothedPoints
     */
    endDrawing() {
        this.smoothedPoints = null
    }

}
