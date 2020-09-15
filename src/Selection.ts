import xs from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import concat from "xstream/extra/concat";
import { Painter } from "./Painter";
import { Shape } from "./Shape";
import { MouseStream, Rect, Config } from "./types";

export const EMPTY_SELECTION = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

function draw(painter: Painter, config: Config, rect: Rect) {
  const { x, y, width, height } = rect;

  if (!width || !height) {
    return;
  }

  painter.disableShadow();

  painter.setLineWidth(1);
  painter.setLineDash([]);
  painter.setStrokeStyle(config.SElECTION_BOX_COLOR);
  painter.setFillStyle(config.SELECTION_BOX_BACKGROUND);

  painter.beginPath();
  painter.rect(x + 0.5, y + 0.5, width, height);
  painter.stroke();
  painter.fill();
}

/**
 * 输入：开始画
 * 输出：最终选区
 */
export function Selection({
  painter,
  mouseStream: { mouseDown$, mouseMove$, mouseUp$ },
  config,
  hoverShape$,
  hoverThumb$,
}: {
  painter: Painter;
  mouseStream: MouseStream;
  config: Config;
  hoverShape$: xs<Shape | false>;
  hoverThumb$: xs<boolean>;
}) {
  const selection$ = mouseDown$
    .compose(sampleCombine(hoverShape$, hoverThumb$))
    .filter(([, hoverShape, hoverThumb]) => !hoverShape && !hoverThumb)
    .map(([p]) => {
      const moves$ = mouseMove$.endWhen(mouseUp$).fold<Rect>(
        (acc, value) => {
          return {
            ...acc,
            width: value.x - acc.x,
            height: value.y - acc.y,
          };
        },
        { ...p, width: 0, height: 0 }
      );

      return concat(moves$, xs.of(EMPTY_SELECTION));
    })
    .flatten()
    .startWith(EMPTY_SELECTION);

  const drawSelection$ = selection$.map((rect) => () => {
    draw(painter, config, rect);
  });
  
  return {
    selection$,
    drawSelection$,
  };
}
