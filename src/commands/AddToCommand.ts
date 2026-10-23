import { EditCommand } from './EditCommand.js';
import type { SvgDocument } from '../domain/SvgDocument.js';
import type { Arguments } from './Arguments.js';
export class AddToCommand extends EditCommand {
  constructor(private readonly args: Arguments) { super(); }
  protected override apply(document: SvgDocument): string {
    this.args.count(2); document.addTo(this.args.text(0), this.args.text(1));
    return `${document.find(this.args.text(1)).label} moved into g#${this.args.text(0)}`;
  }
}
