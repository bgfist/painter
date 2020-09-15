/**
 * @file 绘制图片
 */

import Shape from './Shape';

import object from '../util/object';
import containPolygon from '../contain/polygon';

export default class Bitmap extends Shape {
    get lineWidth() {
        return this._lineWidth;
    }

    // 图片不描边
    set lineWidth(value) {
        this._lineWidth = 0;
    }

    draw(painter) {
        const me = this,
            points = this.points;

        if (points.length !== 4) {
            return;
        }

        const {x, y} = points[0],
            width = points[1].x - x,
            height = points[3].y - y;

        painter.saveContext()
        painter.setFillStyle(me.fillStyle);
        painter.begin();

        if (me.rotate) {
            // 被动触发方只能每次自行计算旋转中心并且其永远保持在图形中心，故放在此处
            const rect = me.getRect(painter);
            me.rotateOrigin = [
                rect.x + rect.width / 2,
                rect.y + rect.height / 2
            ];
            painter.rotate(me.rotate, me.rotateOrigin);
        }

        // 这里的绘制路径实际上是为了便于判断鼠标的位置，否则无法计算鼠标是否位于图片上
        me.drawPath(painter);

        if (me.image instanceof HTMLImageElement) {
            painter.context.drawImage(me.image, x, y, width, height);
        }
        else {
            painter.fill();
        }

        painter.restoreContext()
    }

    drawPath(painter) {
        painter.drawPoints(this.points);
        painter.close();
    }

    isPointInPath(painter, x, y) {
        return containPolygon(this.points, x, y)
    }

    toJSON() {
        return super.toJSON({
            name: 'Bitmap',
            url: this.url
        })
    }
}

/**
 * 为画板添加位图
 * @static
 * @param {Object} painter Canvas实例
 * @param {Object} config
 * @property {string} config.url 图片路径
 * @property {Object} config.points 图片的四个点
 * @property {number} config.number 图片唯一标识符
 * @param {Function} callback 绘制完成后的回调
 */
Bitmap.addBitmap = function(painter, config, callback) {
    const image = new Image();

    if (typeof config !== 'object') {
        config = {
            url: config,
            points: [
                {x: 0, y: 0},
                {x: 400, y: 0},
                {x: 400, y: 200},
                {x: 0, y: 200}
            ],
            number: '' + Math.floor(Math.random() * (10e10 - 10e9) + 10e9)
        }
    }

    image.onload = function () {
        config = object.extend(
            object.extend({}, painter.config),
            config
        );
        config.image = image;

        painter.addShape(
            new Bitmap(config)
        );

        typeof callback === 'function' && callback();
    };

    image.crossOrigin = 'anonymous';
    image.src = config.url;
};

/**
 * 以递归的形式保证图片按预料的顺序添加
 */
Bitmap.addBitmaps = function (painter, configs) {
    if (configs instanceof  Array) {
        if (configs[0]) {
            Bitmap.addBitmap(
                painter,
                configs[0],
                function () {
                    configs.unshift();
                    Bitmap.addBitmaps(painter, configs);
                }
            )
        }
    }
};
