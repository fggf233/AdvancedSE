import { EditCommand } from './EditCommand.js';
import type { SvgDocument } from '../domain/SvgDocument.js';
import type { Arguments } from './Arguments.js';
export class SetCommand extends EditCommand {
  constructor(private readonly args: Arguments) { super(); }
  protected override apply(document: SvgDocument): string {
    this.args.count(3);
    const shape = document.find(this.args.text(0));
    shape.set(this.args.text(1), this.args.text(2));
    return `${shape.label} updated: ${this.args.text(1)}=${JSON.stringify(this.args.text(2))}`;
  }
}
