import xs from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import dropRepeats from "xstream/extra/dropRepeats";
import { Painter } from "./Painter";
import { Shape } from "./Shape";
import { Config, MouseStream } from "./types";

function draw(painter: Painter, hoverShape: Shape, config: Config) {
  let { hoverThickness, hoverColor } = config;

  painter.beginPath();

  painter.disableShadow();
  painter.setLineWidth(hoverThickness * config.devicePixelRatio);
  painter.setLineDash([]);
  painter.setStrokeStyle(hoverColor);

  hoverShape.draw(painter);
  painter.stroke();
}

export function Hover({
  painter,
  config,
  mouseStream,
  shapes$,
  activeShapes$,
  hoverThumb$,
}: {
  painter: Painter;
  config: Config;
  mouseStream: MouseStream;
  shapes$: xs<Shape[]>;
  activeShapes$: xs<Shape[]>;
  hoverThumb$: xs<boolean>;
}) {
  const hoverShape$ = mouseStream.mouseMove$
    .compose(sampleCombine(shapes$, hoverThumb$))
    .map(([p, shapes, hoverThumb]) => !hoverThumb && shapes.filter((shape) => shape.isPointInPath(p))[0])
    .compose(dropRepeats())
    .startWith(false);

  const drawHoverShape$ = xs.combine(hoverShape$, activeShapes$).map(([hoverShape, activeShapes]) => () => {
    if (hoverShape && activeShapes.indexOf(hoverShape) < 0) {
      draw(painter, hoverShape, config);
    }
  });

  return {
    hoverShape$,
    drawHoverShape$,
  };
}
