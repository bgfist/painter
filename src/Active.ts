import xs from "xstream";
import getUnionRect from "./function/getUnionRect";
import pointInRect from "./function/pointInRect";
import { Painter } from "./Painter";
import { Shape } from "./Shape";
import { Config, MouseStream, Rect } from "./types";
import { getInterRect } from "./utils/getInterRect";
import sampleCombine from "xstream/extra/sampleCombine";
import flattenAll from "./utils/flattenAll";
import defer from "./utils/defer";
import dropRepeats from "xstream/extra/dropRepeats";

function draw(painter: Painter, config: Config, rect: Rect, thumbs: Rect[]) {
  painter.beginPath();
  painter.setLineWidth(1);
  painter.setStrokeStyle(config.ACTIVE_RECT_BOX_COLOR);
  painter.rect(rect.x, rect.y, rect.width, rect.height);
  painter.stroke();
  painter.setStrokeStyle(config.ACTIVE_RECT_INNER_BOX_COLOR);
  thumbs.forEach((rect) => {
    painter.rect(rect.x, rect.y, rect.width, rect.height);
  });
  painter.stroke();
}

const thumbSize = 6;

enum ThumbPosition {
  None = -2,
  Move = -1,
  LEFT_TOP = 0,
  CENTER_TOP = 1,
  RIGHT_TOP = 2,
  RIGHT_MIDDLE = 3,
  RIGHT_BOTTOM = 4,
  CENTER_BOTTOM = 5,
  LEFT_BOTTOM = 6,
  LEFT_MIDDLE = 7,
  ROTATE_THUMB = 8,
}

/**
 * 输入：选区
 * 输出：要更改的图形
 */
export function Active({
  painter,
  mouseStream: { mouseDown$, mouseMove$, mouseUp$ },
  shapes$,
  selection$,
  hoverShape$,
  config,
}: {
  painter: Painter;
  mouseStream: MouseStream;
  shapes$: xs<Shape[]>;
  selection$: xs<Rect>;
  hoverShape$: xs<Shape | false>;
  config: Config;
}) {
  const activeShapes$ = xs
    .merge(
      // 框选
      selection$
        .filter((rect) => rect.width > config.SIZE_MIN && rect.height > config.SIZE_MIN)
        .compose(sampleCombine(shapes$))
        .map(([selection, shapes]) => shapes.filter((shape) => getInterRect(shape.getRect(), selection))),
      // 点选
      mouseDown$.compose(sampleCombine(hoverShape$)).map(([, hoverShape]) => hoverShape)
    )
    .compose(dropRepeats())
    .fold<Shape[]>((acc, value) => {
      if (Array.isArray(value)) {
        return value;
      } else {
        if (value) {
          if (acc.indexOf(value) > -1) {
            return acc;
          } else {
            return [value];
          }
        } else {
          return [];
        }
      }
    }, []);

  const activeRectAndThumbs$ = activeShapes$.map((shapes) => {
    // 新选中一个图形时，要重新更新旋转信息
    // if (shapes.length === 1) {
    //   this.rotate = shapes[0].rotate;
    //   this.rotateOrigin = shapes[0].rotateOrigin;
    // }

    if (shapes.length > 0) {
      const rect = getUnionRect(
        shapes.map(function (shape) {
          // 选中的图形在1个以上时,需要拿到旋转以后的外切矩形
          if (shapes.length > 1) {
            return shape.getOuterRect();
          } else {
            return shape.getRect();
          }
        })
      );

      const left = {
        pos: ThumbPosition.LEFT_BOTTOM,
        x: rect.x - thumbSize / 2,
        y: rect.y - thumbSize / 2,
        width: thumbSize,
        height: thumbSize,
      };

      const thumbs = [left];

      return {
        rect,
        thumbs,
      };
    } else {
      return null;
    }
  });

  const { dragging$, updateShapes$ } = mouseDown$
    .compose(sampleCombine(defer(() => currentBox$)))
    .map(([p, currentBox]) => {
      const moves$ = mouseMove$.endWhen(mouseUp$).fold((acc, p) => {
        switch (currentBox) {
          case ThumbPosition.Move:
            break;
          case ThumbPosition.ROTATE_THUMB:
            break;
          case ThumbPosition.LEFT_TOP:
            break;
          case ThumbPosition.RIGHT_TOP:
            break;
          case ThumbPosition.LEFT_BOTTOM:
            break;
          case ThumbPosition.RIGHT_BOTTOM:
            break;
          case ThumbPosition.CENTER_TOP:
            break;
          case ThumbPosition.CENTER_BOTTOM:
            break;
          case ThumbPosition.LEFT_MIDDLE:
            break;
          case ThumbPosition.RIGHT_MIDDLE:
            break;
        }

        return acc;
      }, p);

      const dragging$ = moves$.last().mapTo(false).startWith(true);

      const updateShapes$ = xs.empty<any[]>();

      return {
        dragging$,
        updateShapes$,
      };
    })
    .compose(flattenAll("dragging$", "updateShapes$"));

  const currentBox$ = mouseMove$
    .compose(sampleCombine(activeRectAndThumbs$, dragging$))
    .filter(([, , dragging]) => !dragging)
    .map<ThumbPosition>(([p, activeRectAndThumbs]) => {
      // TODO: 扩大热区

      if (!activeRectAndThumbs) {
        return ThumbPosition.None;
      }

      return (
        activeRectAndThumbs.thumbs.find((thumb) => pointInRect(p, thumb))?.pos ||
        (pointInRect(p, activeRectAndThumbs.rect) && ThumbPosition.Move) ||
        ThumbPosition.None
      );
    })
    .startWith(ThumbPosition.None) as xs<ThumbPosition>;

  const hoverThumb$ = currentBox$.map((currentBox) => currentBox > ThumbPosition.Move);

  const drawActiveRect$ = activeRectAndThumbs$.map((activeRectAndThumbs) => () => {
    if (!activeRectAndThumbs) {
      return;
    }

    const { rect, thumbs } = activeRectAndThumbs;
    draw(painter, config, rect, thumbs);
  });

  return {
    activeShapes$,
    updateShapes$,
    hoverThumb$,
    drawActiveRect$,
  };
}
