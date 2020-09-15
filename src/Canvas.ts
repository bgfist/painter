import xs from "xstream";
import dropRepeats from "xstream/extra/dropRepeats";
import { Active } from "./Active";
import { Hover } from "./Hover";
import { Painter, PainterCacheOptions } from "./Painter";
import { Shape, ShapeCtor } from "./Shape";
import { Config, MouseStream, Size } from "./types";
import { Selection } from "./Selection";
import flattenAll from "./utils/flattenAll";
import defer from "./utils/defer";
import sampleCombine from "xstream/extra/sampleCombine";

function State({
  painter,
  config,
  shapes$,
  mouseStream,
}: {
  painter: Painter;
  config: Config;
  shapes$: xs<Shape[]>;
  mouseStream: MouseStream;
}) {
  const { hoverShape$, drawHoverShape$ } = Hover({
    painter,
    mouseStream,
    config,
    shapes$,
    activeShapes$: defer(() => activeShapes$),
    hoverThumb$: defer(() => hoverThumb$),
  });

  const { selection$, drawSelection$ } = Selection({
    painter,
    mouseStream,
    config,
    hoverShape$,
    hoverThumb$: defer(() => hoverThumb$),
  });

  const { activeShapes$, updateShapes$, hoverThumb$, drawActiveRect$ } = Active({
    painter,
    mouseStream,
    config,
    shapes$,
    selection$,
    hoverShape$,
  });

  const drawState$ = xs
    .combine(drawHoverShape$, drawSelection$, drawActiveRect$)
    .map(([drawHoverShape, drawSelection, drawActiveRect]) => () => {
      // 按层级顺序重绘
      painter.clear();
      drawHoverShape();
      drawSelection();
      drawActiveRect();
    });

  return {
    activeShapes$,
    updateShapes$,
    drawState$,
  };
}

export function Canvas({
  canvas,
  stateCanvas,
  cacheOptions,
  mouseStream,
  draw$,
  config$,
  resize$,
  prev$,
  next$,
  deleteActive$,
}: {
  canvas: HTMLCanvasElement;
  stateCanvas: HTMLCanvasElement;
  cacheOptions?: PainterCacheOptions;
  mouseStream: MouseStream;
  draw$: xs<ShapeCtor | null | false>;
  config$: xs<Config>;
  resize$: xs<Size>;
  prev$: xs<void>;
  next$: xs<void>;
  clear$: xs<void>;
  deleteActive$: xs<void>;
}) {
  const shapePainter = Painter({ canvas, size$: resize$, cacheOptions });
  const statePainter = Painter({ canvas: stateCanvas, size$: resize$, cacheOptions });

  config$ = config$.startWith({
    devicePixelRatio: 2,
    // SELECTION框样式配置
    SElECTION_BOX_COLOR: "#ccc",
    SELECTION_BOX_BACKGROUND: "rgba(180, 180, 180, .1)",

    // ACTIVE框样式配置
    ACTIVE_RECT_BOX_COLOR: "#ccc",
    ACTIVE_RECT_INNER_BOX_COLOR: "#c0ced8",

    // HOVER框样式配置
    hoverThickness: 2,
    hoverColor: "#ff0000",

    STROKE_POSITION_INSIDE: 1,
    STROKE_POSITION_CENTER: 2,
    STROKE_POSITION_OUTSIDE: 3,

    SIZE_MIN: 6,

    fillStyle: "#cccccc",
    strokeStyle: "#cccccc",
    lineWidth: 2,
    lineDashType: 1,
  });

  const { drawing$, shapeReducer$ } = xs
    .combine(draw$, config$)
    .map(([ShapeCtor, config]) => {
      if (ShapeCtor) {
        const { shape$, drawShape$ } = ShapeCtor({
          painter: shapePainter,
          mouseStream,
          config,
        });

        const shapeReducer$ = shape$.map((shape) => (shapes: Shape[]) => [...shapes, shape]);

        return {
          shapeReducer$,
          drawing$: drawShape$,
        };
      } else if (ShapeCtor === null) {
        const { activeShapes$, drawState$, updateShapes$ } = State({
          painter: statePainter,
          config,
          shapes$,
          mouseStream,
        });

        const shapeReducer$ = xs.merge(
          updateShapes$.map((updateShapes) => (shapes: Shape[]) => {
            updateShapes.forEach((updateShape) => {
              const idx = shapes.findIndex((shape) => shape.id === updateShape.id);
              if (idx > -1) {
                shapes[idx] = {
                  ...shapes[idx],
                  ...updateShape,
                };
              }
            });
            return shapes;
          }),
          deleteActive$.compose(sampleCombine(activeShapes$)).map(([, activeShapes]) => (shapes: Shape[]) => {
            activeShapes.forEach((activeShape) => {
              const idx = shapes.indexOf(activeShape);
              shapes.splice(idx, 1);
            });
            return shapes;
          })
        );

        return {
          shapeReducer$,
          drawing$: drawState$,
        };
      } else {
        return {
          shapeReducer$: xs.empty<(shapes: Shape[]) => Shape[]>(),
          drawing$: xs.empty(),
        };
      }
    })
    .compose(flattenAll("shapeReducer$", "drawing$"));

  const undoRedoReducer$ = xs.merge(
    prev$.map(() => (stack: UndoStack) => {
      const prev = stack.undos.pop();

      if (!prev) {
        return stack;
      } else {
        stack.redos.push(prev);
      }

      return stack;
    }),
    next$.map(() => (stack: UndoStack) => {
      const next = stack.redos.pop();

      if (!next) {
        return stack;
      } else {
        stack.undos.push(next);
      }

      return stack;
    })
  );

  const histories$ = xs
    .merge(
      shapeReducer$
        .map((shapeReducer) => (stack: UndoStack) => {
          const shapes = stack.undos[stack.undos.length - 1];
          stack.undos.push(shapeReducer(shapes));
          stack.redos.length = 0;
          return stack;
        })
        .debug("shapes change"),
      undoRedoReducer$.debug("undoredo")
    )
    .fold<UndoStack>((acc, reducer) => reducer(acc), {
      undos: [[]],
      redos: [],
    })
    .debug("stack")
    .map(({ undos, redos }) => {
      return {
        shapes: undos[undos.length - 1],
        hasPrev: undos.length > 0,
        hasNext: redos.length > 0,
      };
    })
    .debug("histories");

  const shapes$ = histories$.map((histories) => histories.shapes).debug("shapes");

  const drawCanvas$ = xs
    .merge(
      drawing$,
      shapes$.map((shapes) => () => {
        shapePainter.clear();
        shapes.forEach((shape) => {
          shape.draw(shapePainter);
        });
      })
    )
    .map((func) => func());

  return {
    histories$,
    drawCanvas$,
  };
}

export { ShapeCtor } from "./Shape";

export interface UndoStack {
  undos: Array<Shape[]>;
  redos: Array<Shape[]>;
}
