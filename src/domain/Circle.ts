import { GeometryShape } from './GeometryShape.js';
export class Circle extends GeometryShape {
  constructor(id: string) { super(id, 'circle', ['cx'], ['cy'], ['r']); }
  override clone(): Circle { return this.copyInto(new Circle(this.id)) as Circle; }
}
