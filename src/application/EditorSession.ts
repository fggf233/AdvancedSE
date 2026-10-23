import { SvgDocument } from '../domain/SvgDocument.js';
import { History } from './History.js';
import type { DocumentStore } from './DocumentStore.js';
import type { EditOperation } from './EditOperation.js';

export class EditorSession {
  private current?: SvgDocument;
  private path?: string;
  private readonly history = new History();
  constructor(private readonly store: DocumentStore) {}
  get document(): SvgDocument {
    if (!this.current) throw new Error("no document. use 'init' or 'read' first");
    return this.current;
  }
  init(width: number, height: number): string[] {
    const document = new SvgDocument(width, height);
    this.current = document; this.path = undefined; this.history.barrier();
    return [`canvas ${width}x${height} created`];
  }
  read(path: string): string[] {
    const result = this.store.load(path);
    this.current = result.document; this.path = path; this.history.barrier();
    return [...result.warnings, `read ${path} (${this.document.all().length} elements)`];
  }
  save(path?: string): string[] {
    const document = this.document;
    const target = path ?? this.path;
    if (!target) throw new Error('no file path. use save <file.svg>');
    this.store.save(target, document);
    this.path = target; this.history.barrier();
    return [`saved to ${target} (${document.all().length} elements)`];
  }
  canvas(width?: number, height?: number): string[] {
    const document = this.document;
    if (width !== undefined && height !== undefined) {
      document.resize(width, height); this.history.barrier();
    }
    return [`canvas ${document.width}x${document.height}`];
  }
  edit(operation: EditOperation): string[] {
    const result = this.history.execute(operation, this.document);
    this.current = result.document;
    return [result.message];
  }
  undo(): string[] {
    void this.document;
    const result = this.history.undo(); this.current = result.document;
    return [result.message];
  }
  redo(): string[] {
    void this.document;
    const result = this.history.redo(); this.current = result.document;
    return [result.message];
  }
}
