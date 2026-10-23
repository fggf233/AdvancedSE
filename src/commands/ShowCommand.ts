import type { Command } from './Command.js';
import type { Arguments } from './Arguments.js';
import type { EditorSession } from '../application/EditorSession.js';
export class ShowCommand implements Command {
  constructor(private readonly args: Arguments) {}
  execute(session: EditorSession): string[] {
    this.args.count(1); const shape = session.document.find(this.args.text(0)); return [`${shape.label}  parent=${session.document.parentLabel(shape)}`, `  ${shape.describe().slice(shape.label.length).trim()}`];
  }
}
