import { EditorSession } from './application/EditorSession.js';
import { FileDocumentStore } from './infrastructure/FileDocumentStore.js';
import { CommandRunner } from './cli/CommandRunner.js';
import { Repl } from './cli/Repl.js';

await new Repl(new CommandRunner(new EditorSession(new FileDocumentStore()))).start();
