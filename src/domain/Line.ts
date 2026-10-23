import { GeometryShape } from './GeometryShape.js';
export class Line extends GeometryShape {
  constructor(id: string) { super(id, 'line', ['x1', 'x2'], ['y1', 'y2'], []); }
  override clone(): Line { return this.copyInto(new Line(this.id)) as Line; }
}
