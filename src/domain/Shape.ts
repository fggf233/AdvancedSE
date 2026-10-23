import { Numbers } from './Numbers.js';
import type { Group } from './Group.js';

export abstract class Shape {
  private readonly values = new Map<string, string>();
  private owner: Group | null = null;

  protected constructor(private readonly identifier: string, private readonly tag: string) {
    if (!identifier || /[\s<>"'&]/u.test(identifier)) throw new Error(`invalid id: ${identifier}`);
  }

  get id(): string { return this.identifier; }
  get type(): string { return this.tag; }
  get label(): string { return `${this.type}#${this.id}`; }
  get parent(): Group | null { return this.owner; }
  get textContent(): string | null { return null; }
  get children(): readonly Shape[] { return []; }
  asContainer(): Group | null { return null; }
  /** Called only by Group when maintaining both sides of ownership. */
  attach(parent: Group | null): void { this.owner = parent; }
  attributes(): ReadonlyMap<string, string> { return new Map(this.values); }

  set(name: string, value: string): void {
    if (name === 'stroke-width') value = String(Numbers.nonnegative(value, name));
    else if (name !== 'fill' && name !== 'stroke') throw new Error(`unknown attribute: ${name}`);
    this.values.set(name, value);
  }

  protected put(name: string, value: string): void { this.values.set(name, value); }
  protected number(name: string): number { return Number(this.values.get(name) ?? 0); }
  protected copyInto(target: Shape): Shape {
    for (const [key, value] of this.values) target.put(key, value);
    return target;
  }
  contains(shape: Shape): boolean {
    return this === shape || this.children.some(child => child.contains(shape));
  }
  describe(): string {
    return `${this.label}${[...this.values].map(([k, v]) => ` ${k}=${v}`).join('')}`;
  }
  abstract move(dx: number, dy: number): void;
  abstract scale(factor: number): void;
  abstract clone(): Shape;
}
