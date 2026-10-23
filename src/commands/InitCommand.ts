import type { Command } from './Command.js';
import type { Arguments } from './Arguments.js';
import type { EditorSession } from '../application/EditorSession.js';
export class InitCommand implements Command {
  constructor(private readonly args: Arguments) {}
  execute(session: EditorSession): string[] {
    this.args.count(0, 2); return session.init(this.args.length > 0 ? this.args.number(0) : 800, this.args.length > 1 ? this.args.number(1) : 600);
  }
}
