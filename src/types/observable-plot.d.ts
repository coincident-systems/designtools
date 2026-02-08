declare module "@observablehq/plot" {
  export interface PlotOptions {
    marks?: any[];
    width?: number;
    height?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    style?: Record<string, string> | string;
    x?: any;
    y?: any;
    color?: any;
    r?: any;
    fx?: any;
    fy?: any;
    facet?: any;
    grid?: boolean;
    inset?: number;
    round?: boolean;
    clip?: boolean | string;
    projection?: any;
    [key: string]: any;
  }

  export function plot(options: PlotOptions): SVGSVGElement;
  export function barY(data: any, options?: any): any;
  export function barX(data: any, options?: any): any;
  export function dot(data: any, options?: any): any;
  export function line(data: any, options?: any): any;
  export function lineY(data: any, options?: any): any;
  export function lineX(data: any, options?: any): any;
  export function areaY(data: any, options?: any): any;
  export function areaX(data: any, options?: any): any;
  export function ruleY(data: any, options?: any): any;
  export function ruleX(data: any, options?: any): any;
  export function text(data: any, options?: any): any;
  export function tickY(data: any, options?: any): any;
  export function tickX(data: any, options?: any): any;
  export function frame(options?: any): any;
  export function gridY(options?: any): any;
  export function gridX(options?: any): any;
  export function linearRegressionY(data: any, options?: any): any;
  export function crosshair(data: any, options?: any): any;
  export function tip(data: any, options?: any): any;
  export function cell(data: any, options?: any): any;
  export function rect(data: any, options?: any): any;
  export function rectY(data: any, options?: any): any;
  export function rectX(data: any, options?: any): any;
  export function link(data: any, options?: any): any;
  export function arrow(data: any, options?: any): any;
  export function image(data: any, options?: any): any;
  export function vector(data: any, options?: any): any;
  export function contour(data: any, options?: any): any;
  export function density(data: any, options?: any): any;
  export function hexbin(data: any, options?: any): any;
}
