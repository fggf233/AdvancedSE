import { GeometryShape } from './GeometryShape.js';
export class Text extends GeometryShape {
  private content = '';
  constructor(id: string) { super(id, 'text', ['x'], ['y'], []); }
  override get textContent(): string { return this.content; }
  override set(name: string, value: string): void {
    if (name === 'text') this.content = value;
    else super.set(name, value);
  }
  override describe(): string { return `${super.describe()} ${JSON.stringify(this.content)}`; }
  override clone(): Text {
    const copy = this.copyInto(new Text(this.id)) as Text;
    copy.content = this.content;
    return copy;
  }
}
