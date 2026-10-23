import { Shape } from './Shape.js';
import { Numbers } from './Numbers.js';

export abstract class GeometryShape extends Shape {
  protected constructor(id: string, tag: string, private readonly xNames: readonly string[],
    private readonly yNames: readonly string[], private readonly sizes: readonly string[]) {
    super(id, tag);
    for (const name of [...xNames, ...yNames, ...sizes]) this.put(name, '0');
  }
  override set(name: string, value: string): void {
    if (this.sizes.includes(name)) this.put(name, String(Numbers.nonnegative(value, name)));
    else if (this.xNames.includes(name) || this.yNames.includes(name)) {
      this.put(name, String(Numbers.finite(value, name)));
    } else super.set(name, value);
  }
  override move(dx: number, dy: number): void {
    Numbers.finite(dx); Numbers.finite(dy);
    const changes = [...this.xNames.map(name => [name, this.number(name) + dx] as const),
      ...this.yNames.map(name => [name, this.number(name) + dy] as const)];
    changes.forEach(([, value]) => Numbers.finite(value));
    changes.forEach(([name, value]) => this.put(name, String(value)));
  }
  override scale(factor: number): void {
    Numbers.positive(factor, 'scale factor');
    const changes = [...this.xNames, ...this.yNames, ...this.sizes]
      .map(name => [name, Numbers.finite(this.number(name) * factor)] as const);
    changes.forEach(([name, value]) => this.put(name, String(value)));
  }
}
