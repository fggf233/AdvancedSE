import type { EditorSession } from '../application/EditorSession.js';
import { Tokenizer } from './Tokenizer.js';
import { CommandDispatcher } from './CommandDispatcher.js';
export class CommandRunner {
  private readonly tokenizer = new Tokenizer();
  private readonly dispatcher = new CommandDispatcher();
  constructor(private readonly session: EditorSession) {}
  run(line: string): string[] {
    try {
      const tokens = this.tokenizer.tokenize(line);
      return tokens.length ? this.dispatcher.parse(tokens).execute(this.session) : [];
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unexpected failure';
      return [`error: ${message.replace(/[\r\n]+/gu, ' ')}`];
    }
  }
}
