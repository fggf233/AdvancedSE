import type { EditorSession } from '../application/EditorSession.js';
export interface Command { execute(session: EditorSession): string[]; }
