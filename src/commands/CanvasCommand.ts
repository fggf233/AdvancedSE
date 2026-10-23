import type { Command } from './Command.js';
import type { Arguments } from './Arguments.js';
import type { EditorSession } from '../application/EditorSession.js';
export class CanvasCommand implements Command {
  constructor(private readonly args: Arguments) {}
  execute(session: EditorSession): string[] {
    this.args.count(0, 2); if (this.args.length === 1) throw new Error('canvas requires both width and height'); return session.canvas(this.args.length ? this.args.number(0) : undefined, this.args.length ? this.args.number(1) : undefined);
  }
}
