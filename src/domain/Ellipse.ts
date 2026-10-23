import { GeometryShape } from './GeometryShape.js';
export class Ellipse extends GeometryShape {
  constructor(id: string) { super(id, 'ellipse', ['cx'], ['cy'], ['rx', 'ry']); }
  override clone(): Ellipse { return this.copyInto(new Ellipse(this.id)) as Ellipse; }
}
