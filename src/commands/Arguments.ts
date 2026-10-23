import { Numbers } from '../domain/Numbers.js';
import type { Argument } from './Argument.js';

export class Arguments {
  constructor(private readonly items: readonly Argument[]) {}
  get length(): number { return this.items.length; }
  count(min: number, max = min): void {
    if (this.length < min || this.length > max) throw new Error('invalid arguments. use help for syntax');
  }
  text(index: number): string { return this.items[index].value; }
  number(index: number): number { return Numbers.finite(this.text(index)); }
  values(start = 0): string[] { return this.items.slice(start).map(item => item.value); }
  withParent(): { args: Arguments; parent?: string } {
    const marker = this.items.at(-2);
    if (marker?.value === 'in' && !marker.quoted) {
      return { args: new Arguments(this.items.slice(0, -2)), parent: this.items.at(-1)!.value };
    }
    return { args: this };
  }
}
