import xs from "xstream";

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Point, Size {}

export interface MouseStream {
  mouseDown$: xs<Point>;
  mouseMove$: xs<Point>;
  mouseUp$: xs<Point>;
}

export interface Config {
  devicePixelRatio: number;

  // SELECTION框样式配置
  SElECTION_BOX_COLOR: string;
  SELECTION_BOX_BACKGROUND: string;

  // ACTIVE框样式配置
  ACTIVE_RECT_BOX_COLOR: string;
  ACTIVE_RECT_INNER_BOX_COLOR: string;

  ACTIVE_INFO_RECT_HEIGHT?: number;
  ACTIVE_INFO_RECT_MARGIN?: number;
  ACTIVE_INFO_RECT_PADDING?: number;
  ACTIVE_INFO_RECT_FONT_SIZE?: number;
  ACTIVE_INFO_RECT_BACKGROUND?: string;
  ACTIVE_INFO_RECT_COLOR?: string;

  // HOVER框样式配置
  hoverThickness: number;
  hoverColor: string;

  STROKE_POSITION_INSIDE: 1;
  STROKE_POSITION_CENTER: 2;
  STROKE_POSITION_OUTSIDE: 3;

  SIZE_MIN: number;

  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  lineDashType: number;
}
