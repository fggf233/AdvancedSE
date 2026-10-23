import { Shape } from './Shape.js';
import { Rect } from './Rect.js';
import { Circle } from './Circle.js';
import { Ellipse } from './Ellipse.js';
import { Line } from './Line.js';
import { Text } from './Text.js';
import { Group } from './Group.js';

interface Definition {
  readonly make: (id: string) => Shape;
  readonly required: readonly string[];
  readonly optional?: string;
}

/** The single shape-name dispatch point, shared by CLI and SVG import. */
export class ShapeFactory {
  private readonly definitions = new Map<string, Definition>([
    ['rect', { make: id => new Rect(id), required: ['x', 'y', 'width', 'height'], optional: 'fill' }],
    ['circle', { make: id => new Circle(id), required: ['cx', 'cy', 'r'], optional: 'fill' }],
    ['ellipse', { make: id => new Ellipse(id), required: ['cx', 'cy', 'rx', 'ry'], optional: 'fill' }],
    ['line', { make: id => new Line(id), required: ['x1', 'y1', 'x2', 'y2'], optional: 'stroke' }],
    ['text', { make: id => new Text(id), required: ['x', 'y', 'text'] }],
    ['g', { make: id => new Group(id), required: [] }],
  ]);
  private definition(type: string): Definition {
    const entry = this.definitions.get(type);
    if (!entry) throw new Error(`unknown shape type: ${type} (is the plugin loaded?)`);
    return entry;
  }
  create(type: string, id: string, params: readonly string[]): Shape {
    const def = this.definition(type);
    if (params.length < def.required.length || params.length > def.required.length + Number(!!def.optional)) {
      throw new Error(`invalid arguments for create ${type}`);
    }
    const shape = def.make(id);
    def.required.forEach((name, index) => shape.set(name, params[index]));
    if (def.optional && params.length > def.required.length) shape.set(def.optional, params.at(-1)!);
    return shape;
  }
  fromAttributes(type: string, id: string, attributes: ReadonlyMap<string, string>, text: string): Shape {
    const shape = this.definition(type).make(id);
    for (const [name, value] of attributes) shape.set(name, value);
    if (shape.textContent !== null) shape.set('text', text);
    return shape;
  }
}
