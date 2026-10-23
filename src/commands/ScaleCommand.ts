import { EditCommand } from './EditCommand.js';
import type { SvgDocument } from '../domain/SvgDocument.js';
import type { Arguments } from './Arguments.js';
export class ScaleCommand extends EditCommand {
  constructor(private readonly args: Arguments) { super(); }
  protected override apply(document: SvgDocument): string {
    this.args.count(2);
    const shape = document.find(this.args.text(0)), factor = this.args.number(1);
    shape.scale(factor);
    return `${shape.label} scaled by ${factor}`;
  }
}
