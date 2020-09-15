/**
 * @file 文字
 * @author wangtianhua
 */
import Shape from './Shape'
import containRect from '../contain/rect'
import array from '../util/array'
import constant from '../constant'
import Emitter from '../Emitter'

const TRANSPARENT = 'rgba(0,0,0,0)'
const borderSize = 1

let textarea
let p

function getLineHeight(fontSize) {
    return Math.floor(fontSize + fontSize / 6)
}

function getTextSize(shape, text) {
    text = text || 'W'
    const {fontSize, fontFamily, fontWeight} = shape
    const parentElement = document.body

    p = document.createElement('p')
    p.style.cssText = `
        position: absolute;
        visibility: hidden;
        font: ${fontWeight ? 'bold' : ''} ${fontSize}px ${fontFamily};
        line-height: ${getLineHeight(fontSize)}px;
    `
    p.innerHTML = (text + '').replace(/ /g, '&nbsp;').replace(/\n/g, '<br>').replace(/(<br>)$/g, '<br>W')

    parentElement.appendChild(p)
    let {offsetWidth, offsetHeight} = p
    parentElement.removeChild(p)

    return {
        // 避免小数问题导致换行
        width: offsetWidth + 2 * borderSize,
        height: offsetHeight + 2 * borderSize
    }
}

function createTextarea(painter, emitter, shape) {

    const { fontSize, fontFamily, fontItalic, fontWeight, caretColor, fillStyle } = shape
    const parentElement = document.body

    const dpr = constant.DEVICE_PIXEL_RATIO
    const canvasSize = painter.getCanvasSize()
    const maxWidth = (canvasSize.width - shape.x) / dpr
    const maxHeight = (canvasSize.height - shape.y) / dpr
    const { width: textareaWidth, height: textareaHeight } = getTextSize(shape, shape.text)

    textarea = document.createElement('textarea')
    textarea.spellcheck = false

    let style = `
        position: absolute;
        left: 0;
        top: 0;
        transform: translate(${shape.pageX - borderSize}px, ${shape.pageY + borderSize}px);
        color: ${fillStyle};
        caret-color: ${caretColor || fillStyle};
        background-color: ${TRANSPARENT};
        font: ${fontSize}px ${fontFamily};
        line-height: ${getLineHeight(fontSize)}px;
        border: ${borderSize}px dashed ${fillStyle};
        box-sizing: content-box;
        outline: none;
        resize: none;
        padding: 0;
        overflow-y: hidden;
        width: ${textareaWidth}px;
        height: ${textareaHeight}px;
        max-width: ${maxWidth}px;
        max-height: ${maxHeight}px;
        wrap: physical;
    `

    if (fontItalic) {
        style += 'font-style: italic;';
    }
    if (fontWeight) {
        style += 'font-weight: bold;';
    }

    textarea.value = shape.text || ''
    textarea.style.cssText = style
    parentElement.appendChild(textarea)
    setTimeout(() => textarea.focus())

    let locked = false

    const updateValue = function () {
        shape.text = textarea.value
    }

    const onInput = function () {
        let { width, height } = getTextSize(shape, textarea.value)

        textarea.style.width = width + 'px'
        textarea.style.height = height + 'px'

        if (!locked) {
            updateValue()
            emitter.fire(
                Emitter.SHAPE_TEXT_INPUT,
                {
                    shape: shape,
                    textarea: textarea,
                    // 加上border的宽度
                    width: width + 2 * borderSize,
                    height: height + 2 * borderSize
                }
            )
        }
    }

    const onCompositionStart = function () {
        locked = true
    }

    const onCompositionEnd = function () {
        locked = false
        onInput()
    }

    const onBlur = function () {
        textarea.removeEventListener('input', onInput)
        textarea.removeEventListener('compositionstart', onCompositionStart)
        textarea.removeEventListener('compositionend', onCompositionEnd)
        textarea.removeEventListener('blur', onBlur)

        parentElement.removeChild(textarea)
        p = textarea = null
        shape.textarea = null

        emitter.fire(
            Emitter.SHAPE_DRAWING_END,
            {
                shape
            }
        )

        emitter.fire(
            Emitter.SHAPE_TEXT_BLUR,
            {
                shape
            }
        )

        // 修正状态放在最后，SHAPE_DRAWING_END依赖此字段判断是否触发addShape
        shape.isReEdit = false
    }

    textarea.addEventListener('input', onInput)
    textarea.addEventListener('compositionstart', onCompositionStart)
    textarea.addEventListener('compositionend', onCompositionEnd)
    textarea.addEventListener('blur', onBlur)

    shape.textarea = textarea

    emitter.fire(
        Emitter.SHAPE_DRAWING_START,
        {
            cursor: 'text',
            needRefresh: shape.isReEdit
        }
    )
}

export default class Text extends Shape {
    constructor(props) {
        super(props);
        this.isReEdit = false
        this.text = this.text || ''
    }

    isPointInPath(painter, x, y) {
        return containRect(this.getRect(painter), x, y)
    }

    draw(painter) {
       !this.textarea && super.draw(painter)
    }

    drawPath(painter) {
        const rect = this.getRect(painter)
        painter.drawRect(rect.x, rect.y, rect.width, rect.height)
    }

    fill(painter) {
        const { x, y, text, fontSize, fontFamily, fontItalic, fontWeight } = this
        const dpr = constant.DEVICE_PIXEL_RATIO

        painter.setFillStyle(this.fillStyle, this.fillAlpha)
        painter.setFont(
            fontSize * dpr,
            fontFamily,
            fontItalic,
            fontWeight
        )
        const height = fontSize * dpr + fontSize * dpr / 6
        array.each(
            text.split('\n'),
            function (value, index) {
                painter.fillText(x, y + fontSize * dpr + height * index, value)
            }
        )
    }

    stroke(painter) {

        const { x, y, text, fontSize, fontFamily, fontItalic, fontWeight, lineWidth, strokeStyle, strokeAlpha } = this

        const dpr = constant.DEVICE_PIXEL_RATIO

        painter.setLineWidth(lineWidth)
        painter.setLineDash([])
        painter.setStrokeStyle(strokeStyle, strokeAlpha)
        painter.setFont(
            fontSize * dpr,
            fontFamily,
            fontItalic,
            fontWeight
        )
        const height = fontSize * dpr + fontSize * dpr / 6

        array.each(
            text.split('\n'),
            function (value, index) {
                painter.strokeText(x, y + fontSize * dpr + height * index, value)
            }
        )
    }

    startDrawing(painter, emitter, event, isReEdit = false) {
        if (!textarea) {
            this.isReEdit = isReEdit
            this.x = this.x || event.x
            this.y = this.y || event.y
            this.pageX = isReEdit ? this.x / constant.DEVICE_PIXEL_RATIO + event.canvasOffsetX - event.containerScrollX : event.pageX
            this.pageY = isReEdit ? this.y / constant.DEVICE_PIXEL_RATIO + event.canvasOffsetY - event.containerScrollY : event.pageY

            createTextarea(painter, emitter, this)
        }

        return false
    }

    validate() {
        const {text} = this
        return !this.isReEdit && text && text.trim().length
    }

    save(rect) {
        return {
            x: (this.x - rect.x) / (rect.width || 1),
            y: (this.y - rect.y) / (rect.height || 1),
        }
    }

    restore(rect, data) {
        this.x = rect.x + rect.width * data.x
        this.y = rect.y + rect.height * data.y
    }

    getRect(painter) {
        const {x, y, text, fontSize, fontFamily, fontItalic, fontWeight} = this

        painter.setFont(
            fontSize * constant.DEVICE_PIXEL_RATIO,
            fontFamily,
            fontItalic,
            fontWeight
        )

        let rect = getTextSize(this, text)
        rect.x = x
        rect.y = y
        rect.width *= constant.DEVICE_PIXEL_RATIO
        rect.height *= constant.DEVICE_PIXEL_RATIO

        return rect
    }

    toJSON() {
        return super.toJSON({
            name: 'Text',
            x: this.x,
            y: this.y,
            text: this.text,
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            fontItalic: this.fontItalic,
            fontWeight: this.fontWeight,
        })
    }

}
