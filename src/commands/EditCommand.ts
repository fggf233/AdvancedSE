import type { EditorSession } from '../application/EditorSession.js';
import type { EditOperation } from '../application/EditOperation.js';
import type { SvgDocument } from '../domain/SvgDocument.js';
import type { Command } from './Command.js';

export abstract class EditCommand implements Command, EditOperation {
  private before?: SvgDocument;
  private after?: SvgDocument;
  private summary = '';
  get description(): string { return this.summary; }
  execute(session: EditorSession): string[] { return session.edit(this); }
  perform(document: SvgDocument): { document: SvgDocument; message: string } {
    const working = document.clone();
    const message = this.apply(working);
    this.before = document.clone(); this.after = working.clone(); this.summary = message;
    return { document: working, message };
  }
  undo(): SvgDocument {
    if (!this.before) throw new Error('command has not executed');
    return this.before.clone();
  }
  redo(): SvgDocument {
    if (!this.after) throw new Error('command has not executed');
    return this.after.clone();
  }
  protected abstract apply(document: SvgDocument): string;
}
