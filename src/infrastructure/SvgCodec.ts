import { DOMParser, DOMImplementation, XMLSerializer, type Element } from '@xmldom/xmldom';
import { SvgDocument } from '../domain/SvgDocument.js';
import { ShapeFactory } from '../domain/ShapeFactory.js';
import type { Shape } from '../domain/Shape.js';
import { Numbers } from '../domain/Numbers.js';

export class SvgCodec {
  private readonly namespace = 'http://www.w3.org/2000/svg';
  private readonly factory = new ShapeFactory();
  encode(document: SvgDocument): string {
    const xml = new DOMImplementation().createDocument(this.namespace, 'svg', null);
    const root = xml.documentElement!;
    root.setAttribute('width', String(document.width));
    root.setAttribute('height', String(document.height));
    root.setAttribute('viewBox', `0 0 ${document.width} ${document.height}`);
    const append = (shape: Shape, parent: Element, depth: number): void => {
      parent.appendChild(xml.createTextNode(`\n${'  '.repeat(depth)}`));
      const element = xml.createElementNS(this.namespace, shape.type);
      element.setAttribute('id', shape.id);
      for (const [name, value] of shape.attributes()) element.setAttribute(name, value);
      if (shape.textContent !== null) element.appendChild(xml.createTextNode(shape.textContent));
      shape.children.forEach(child => append(child, element, depth + 1));
      if (shape.children.length) element.appendChild(xml.createTextNode(`\n${'  '.repeat(depth)}`));
      parent.appendChild(element);
    };
    document.children.forEach(shape => append(shape, root, 1));
    if (document.children.length) root.appendChild(xml.createTextNode('\n'));
    return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(xml)}\n`;
  }
  decode(source: string): { document: SvgDocument; warnings: string[] } {
    if (/<!DOCTYPE|<!ENTITY/iu.test(source)) throw new Error('unsupported SVG document type declaration');
    const xml = new DOMParser({ onError: (_level, message) => { throw new Error(`invalid XML: ${message}`); } })
      .parseFromString(source, 'image/svg+xml');
    const root = xml.documentElement;
    if (!root || root.localName !== 'svg' || (root.namespaceURI && root.namespaceURI !== this.namespace)) {
      throw new Error('expected an SVG root element');
    }
    // Reject unsupported root rendering state instead of silently losing it on save.
    const rootAttributes = new Set(['width', 'height', 'viewBox', 'xmlns', 'version', 'id']);
    for (let i = 0; i < root.attributes.length; i++) {
      const name = root.attributes.item(i)!.name;
      if (!rootAttributes.has(name)) throw new Error(`unsupported SVG root attribute: ${name}`);
    }
    const width = this.dimension(root.getAttribute('width'), 800);
    const height = this.dimension(root.getAttribute('height'), 600);
    const viewBox = root.getAttribute('viewBox');
    if (viewBox && viewBox.trim().split(/[\s,]+/u).map(Number).join(' ') !== `0 0 ${width} ${height}`) {
      throw new Error('unsupported viewBox: expected 0 0 width height');
    }
    const document = new SvgDocument(width, height);
    const ids = new Set<string>();
    const warnings: string[] = [];
    const reserve = (element: Element): void => {
      const id = element.getAttribute('id');
      if (id) {
        if (ids.has(id)) throw new Error(`id already exists: ${id}`);
        ids.add(id);
      }
      this.elements(element).forEach(reserve);
    };
    this.elements(root).forEach(reserve);
    const convert = (element: Element): Shape => {
      if (element.namespaceURI && element.namespaceURI !== this.namespace) throw new Error('unsupported element namespace');
      const type = element.localName || element.tagName;
      let id = element.getAttribute('id');
      if (!id) {
        let ordinal = 1;
        while (ids.has(`${type}${ordinal}`)) ordinal++;
        id = `${type}${ordinal}`; ids.add(id);
        warnings.push(`warning: assigned id ${id} to unnamed <${type}>`);
      }
      const attributes = new Map<string, string>();
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes.item(i)!;
        if (attr.name !== 'id' && attr.name !== 'xmlns') attributes.set(attr.name, attr.value);
      }
      const shape = this.factory.fromAttributes(type, id, attributes, element.textContent ?? '');
      const children = this.elements(element);
      if (children.length && !shape.asContainer()) throw new Error(`unsupported child element in ${shape.label}`);
      children.forEach(child => shape.asContainer()!.insert(convert(child)));
      return shape;
    };
    this.elements(root).forEach(element => document.add(convert(element)));
    return { document, warnings };
  }
  private dimension(value: string | null, fallback: number): number {
    return value === null || value === '' ? fallback : Numbers.positive(value.replace(/px$/u, ''), 'canvas dimension');
  }
  private elements(element: Element): Element[] {
    const result: Element[] = [];
    for (let i = 0; i < element.childNodes.length; i++) {
      const child = element.childNodes.item(i)!;
      if (child.nodeType === 1) result.push(child as Element);
    }
    return result;
  }
}
