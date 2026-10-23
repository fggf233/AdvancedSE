import { Shape } from './Shape.js';
import { Numbers } from './Numbers.js';

export class Group extends Shape {
  private readonly members: Shape[] = [];
  constructor(id: string) { super(id, 'g'); }
  override get children(): readonly Shape[] { return [...this.members]; }
  override asContainer(): Group { return this; }
  insert(shape: Shape, index = this.members.length): void {
    if (shape.contains(this)) throw new Error(`cannot group a container into its own descendant: ${shape.id}`);
    shape.parent?.remove(shape);
    this.members.splice(index, 0, shape);
    shape.attach(this);
  }
  remove(shape: Shape): number {
    const index = this.members.indexOf(shape);
    if (index < 0) throw new Error(`no such shape: ${shape.id}`);
    this.members.splice(index, 1);
    shape.attach(null);
    return index;
  }
  override move(dx: number, dy: number): void {
    Numbers.finite(dx); Numbers.finite(dy);
    this.members.forEach(child => child.move(dx, dy));
  }
  override scale(factor: number): void {
    Numbers.positive(factor, 'scale factor');
    this.members.forEach(child => child.scale(factor));
  }
  override clone(): Group {
    const result = this.copyInto(new Group(this.id)) as Group;
    this.members.forEach(child => result.insert(child.clone()));
    return result;
  }
}
