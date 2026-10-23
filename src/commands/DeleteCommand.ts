import { EditCommand } from './EditCommand.js';
import type { SvgDocument } from '../domain/SvgDocument.js';
import type { Arguments } from './Arguments.js';
export class DeleteCommand extends EditCommand {
  constructor(private readonly args: Arguments) { super(); }
  protected override apply(document: SvgDocument): string {
    this.args.count(1);
    const shape = document.find(this.args.text(0));
    document.delete(shape.id);
    return `${shape.label} deleted`;
  }
}
