import { createInterface } from 'node:readline';
import type { CommandRunner } from './CommandRunner.js';
export class Repl {
  constructor(private readonly runner: CommandRunner) {}
  async start(): Promise<void> {
    const terminal = Boolean(process.stdin.isTTY && process.stdout.isTTY);
    const input = createInterface({ input: process.stdin, output: process.stdout, terminal });
    console.log("svg-editor 0.1 — type 'help' for commands");
    if (terminal) { input.setPrompt('svg> '); input.prompt(); }
    for await (const line of input) {
      this.runner.run(line).forEach(message => console.log(message));
      if (terminal) input.prompt();
    }
  }
}
