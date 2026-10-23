import { EditCommand } from './EditCommand.js';
import type { SvgDocument } from '../domain/SvgDocument.js';
import type { Arguments } from './Arguments.js';
export class GroupCommand extends EditCommand {
  constructor(private readonly args: Arguments) { super(); }
  protected override apply(document: SvgDocument): string {
    this.args.count(2, Infinity);
    document.group(this.args.text(0), this.args.values(1));
    return `g#${this.args.text(0)} created with ${this.args.length - 1} children`;
  }
}
