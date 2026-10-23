import type { SvgDocument } from '../domain/SvgDocument.js';
export interface EditOperation {
  perform(document: SvgDocument): { document: SvgDocument; message: string };
  undo(): SvgDocument;
  redo(): SvgDocument;
  readonly description: string;
}
