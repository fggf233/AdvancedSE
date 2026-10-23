import type { Command } from './Command.js';
import type { Arguments } from './Arguments.js';
import type { EditorSession } from '../application/EditorSession.js';
export class RedoCommand implements Command {
  constructor(private readonly args: Arguments) {}
  execute(session: EditorSession): string[] {
    this.args.count(0); return session.redo();
  }
}
