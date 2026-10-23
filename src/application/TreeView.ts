import type { Shape } from '../domain/Shape.js';
import type { SvgDocument } from '../domain/SvgDocument.js';
export class TreeView {
  render(document: SvgDocument, id?: string): string[] {
    const node = id === undefined ? undefined : document.find(id);
    const lines = [node ? node.describe() : `svg (${document.width}x${document.height})`];
    this.children(node ? node.children : document.children, '', lines);
    return lines;
  }
  private children(nodes: readonly Shape[], prefix: string, lines: string[]): void {
    nodes.forEach((node, index) => {
      const last = index === nodes.length - 1;
      lines.push(`${prefix}${last ? '└── ' : '├── '}${node.describe()}`);
      this.children(node.children, `${prefix}${last ? '    ' : '│   '}`, lines);
    });
  }
}
