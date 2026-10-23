import { Group } from './Group.js';
import { Shape } from './Shape.js';
import { Numbers } from './Numbers.js';

export class SvgDocument {
  private root = new Group('__document_root__');
  private canvasWidth: number;
  private canvasHeight: number;
  constructor(width = 800, height = 600) {
    this.canvasWidth = Numbers.positive(width, 'width');
    this.canvasHeight = Numbers.positive(height, 'height');
  }
  get width(): number { return this.canvasWidth; }
  get height(): number { return this.canvasHeight; }
  get children(): readonly Shape[] { return this.root.children; }
  resize(width: number, height: number): void {
    Numbers.positive(width, 'width'); Numbers.positive(height, 'height');
    this.canvasWidth = width; this.canvasHeight = height;
  }
  all(): Shape[] {
    const visit = (node: Shape): Shape[] => [node, ...node.children.flatMap(visit)];
    return this.children.flatMap(visit);
  }
  has(id: string): boolean { return this.all().some(shape => shape.id === id); }
  find(id: string): Shape {
    const shape = this.all().find(shape => shape.id === id);
    if (!shape) throw new Error(`no such shape: ${id}`);
    return shape;
  }
  container(id?: string): Group {
    if (id === undefined) return this.root;
    if (!this.has(id)) throw new Error(`no such container: ${id}`);
    const group = this.find(id).asContainer();
    if (!group) throw new Error(`not a container: ${id}`);
    return group;
  }
  add(shape: Shape, parentId?: string): void {
    const parent = this.container(parentId);
    const ids = new Set(this.all().map(node => node.id));
    const check = (node: Shape): void => {
      if (ids.has(node.id)) throw new Error(`id already exists: ${node.id}`);
      ids.add(node.id); node.children.forEach(check);
    };
    check(shape);
    parent.insert(shape);
  }
  delete(id: string): void {
    const shape = this.find(id);
    shape.parent!.remove(shape);
  }
  group(id: string, ids: readonly string[]): void {
    if (this.has(id)) throw new Error(`id already exists: ${id}`);
    if (!ids.length) throw new Error('group requires at least one shape');
    if (new Set(ids).size !== ids.length) throw new Error('duplicate group member');
    const selected = ids.map(id => this.find(id));
    for (const node of selected) {
      if (selected.some(other => node !== other && node.contains(other))) {
        throw new Error(`cannot group a container into its own descendant: ${node.id}`);
      }
    }
    const ordered = this.all().filter(node => selected.includes(node));
    let common = ordered[0].parent!;
    while (!ordered.every(node => common.contains(node))) common = common.parent!;
    const index = common.children.findIndex(branch => ordered.some(node => branch.contains(node)));
    const group = new Group(id);
    common.insert(group, index);
    ordered.forEach(node => group.insert(node));
  }
  ungroup(id: string): void {
    const group = this.container(id);
    const parent = group.parent!;
    if (parent === this.root) throw new Error(`cannot ungroup top-level container: ${id}`);
    const index = parent.remove(group);
    group.children.forEach((child, offset) => parent.insert(child, index + offset));
  }
  addTo(groupId: string, id: string): void { this.container(groupId).insert(this.find(id)); }
  front(id: string): void {
    const shape = this.find(id), parent = shape.parent!;
    parent.remove(shape); parent.insert(shape);
  }
  back(id: string): void {
    const shape = this.find(id), parent = shape.parent!;
    parent.remove(shape); parent.insert(shape, 0);
  }
  parentLabel(shape: Shape): string { return shape.parent === this.root ? 'svg' : shape.parent!.label; }
  clone(): SvgDocument {
    const copy = new SvgDocument(this.width, this.height);
    copy.root = this.root.clone();
    return copy;
  }
}
