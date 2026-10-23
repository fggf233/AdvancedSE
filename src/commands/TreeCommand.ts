import type { Command } from './Command.js';
import type { Arguments } from './Arguments.js';
import type { EditorSession } from '../application/EditorSession.js';
import { TreeView } from '../application/TreeView.js';
export class TreeCommand implements Command {
  constructor(private readonly args: Arguments) {}
  execute(session: EditorSession): string[] {
    this.args.count(0, 1);
    return new TreeView().render(session.document, this.args.length ? this.args.text(0) : undefined);
  }
}
