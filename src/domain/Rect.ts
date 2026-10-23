import { GeometryShape } from './GeometryShape.js';
export class Rect extends GeometryShape {
  constructor(id: string) { super(id, 'rect', ['x'], ['y'], ['width', 'height']); }
  override clone(): Rect { return this.copyInto(new Rect(this.id)) as Rect; }
}
