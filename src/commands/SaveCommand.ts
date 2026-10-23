import type { Command } from './Command.js';
import type { Arguments } from './Arguments.js';
import type { EditorSession } from '../application/EditorSession.js';
export class SaveCommand implements Command {
  constructor(private readonly args: Arguments) {}
  execute(session: EditorSession): string[] {
    this.args.count(0, 1); return session.save(this.args.length ? this.args.text(0) : undefined);
  }
}
