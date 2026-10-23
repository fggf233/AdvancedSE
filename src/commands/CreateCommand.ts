import { EditCommand } from './EditCommand.js';
import { ShapeFactory } from '../domain/ShapeFactory.js';
import type { SvgDocument } from '../domain/SvgDocument.js';
import type { Arguments } from './Arguments.js';
export class CreateCommand extends EditCommand {
  constructor(private readonly args: Arguments) { super(); }
  protected override apply(document: SvgDocument): string {
    const { args, parent } = this.args.withParent();
    args.count(2, Infinity);
    const shape = new ShapeFactory().create(args.text(0), args.text(1), args.values(2));
    document.add(shape, parent);
    return `${shape.label} created${parent ? ` in g#${parent}` : ''}`;
  }
}
