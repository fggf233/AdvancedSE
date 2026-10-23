import type { SvgDocument } from '../domain/SvgDocument.js';
import type { EditOperation } from './EditOperation.js';

export class History {
  private done: EditOperation[] = [];
  private undone: EditOperation[] = [];
  private locked = true;
  execute(operation: EditOperation, document: SvgDocument): { document: SvgDocument; message: string } {
    const result = operation.perform(document);
    this.done.push(operation); this.undone = []; this.locked = false;
    return result;
  }
  barrier(): void { this.done = []; this.undone = []; this.locked = true; }
  undo(): { document: SvgDocument; message: string } {
    this.check();
    const op = this.done.at(-1);
    if (!op) throw new Error('nothing to undo');
    const document = op.undo();
    this.done.pop(); this.undone.push(op);
    return { document, message: `undone: ${op.description}` };
  }
  redo(): { document: SvgDocument; message: string } {
    this.check();
    const op = this.undone.at(-1);
    if (!op) throw new Error('nothing to redo');
    const document = op.redo();
    this.undone.pop(); this.done.push(op);
    return { document, message: `redone: ${op.description}` };
  }
  private check(): void {
    if (this.locked) throw new Error('undo not allowed after io command');
  }
}
