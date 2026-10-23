import type { SvgDocument } from '../domain/SvgDocument.js';
export interface DocumentStore {
  load(path: string): { document: SvgDocument; warnings: string[] };
  save(path: string, document: SvgDocument): void;
}
