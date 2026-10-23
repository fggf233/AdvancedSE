import { EditCommand } from './EditCommand.js';
import type { SvgDocument } from '../domain/SvgDocument.js';
import type { Arguments } from './Arguments.js';
export class MoveCommand extends EditCommand {
  constructor(private readonly args: Arguments) { super(); }
  protected override apply(document: SvgDocument): string {
    this.args.count(3);
    const shape = document.find(this.args.text(0));
    const dx = this.args.number(1), dy = this.args.number(2);
    shape.move(dx, dy);
    return `${shape.label} moved by (${dx},${dy})`;
  }
}
