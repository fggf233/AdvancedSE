import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ShapeFactory } from '../src/domain/ShapeFactory.js';
import { SvgDocument } from '../src/domain/SvgDocument.js';

const factory = new ShapeFactory();

test('six built-in types, geometry, style defaults and text content', () => {
  const cases: [string, string[]][] = [
    ['rect', ['1', '2', '3', '4']], ['circle', ['1', '2', '3']],
    ['ellipse', ['1', '2', '3', '4']], ['line', ['1', '2', '3', '4']],
    ['text', ['1', '2', 'hello world']], ['g', []],
  ];
  for (const [type, args] of cases) {
    const shape = factory.create(type, type, args);
    assert.equal(shape.type, type);
    assert.equal(shape.attributes().has('fill'), false);
    assert.deepEqual(shape.clone().attributes(), shape.attributes());
  }
  assert.throws(() => factory.create('box', 'n', []), /unknown shape type/);
});

test('group movement and scaling recurse over nested leaves', () => {
  const doc = new SvgDocument();
  doc.add(factory.create('g', 'outer', []));
  doc.add(factory.create('g', 'inner', []), 'outer');
  doc.add(factory.create('rect', 'r', ['10', '20', '30', '40']), 'inner');
  doc.add(factory.create('text', 't', ['5', '6', '开始']), 'inner');
  doc.find('outer').move(1, 2);
  doc.find('outer').scale(2);
  assert.equal(doc.find('r').attributes().get('x'), '22');
  assert.equal(doc.find('r').attributes().get('height'), '80');
  assert.equal(doc.find('t').attributes().get('y'), '16');
  assert.equal(doc.find('t').textContent, '开始');
  doc.find('outer').set('fill', 'red');
  assert.equal(doc.find('outer').attributes().get('fill'), 'red');
  assert.equal(doc.find('r').attributes().has('fill'), false);
});

test('group preserves document order; nested ungroup restores insertion position', () => {
  const doc = new SvgDocument();
  doc.add(factory.create('g', 'scene', []));
  for (const id of ['a', 'b', 'c']) doc.add(factory.create('circle', id, ['0', '0', '1']), 'scene');
  doc.group('pair', ['c', 'a']);
  assert.deepEqual(doc.find('pair').children.map(n => n.id), ['a', 'c']);
  doc.ungroup('pair');
  assert.deepEqual(doc.find('scene').children.map(n => n.id), ['a', 'c', 'b']);
  assert.throws(() => doc.ungroup('scene'), /cannot ungroup top-level/);
});

test('identity, cycle prevention, deletion, z-order and clone independence', () => {
  const doc = new SvgDocument();
  doc.add(factory.create('g', 'g', []));
  doc.add(factory.create('g', 'nested', []), 'g');
  assert.throws(() => doc.addTo('nested', 'g'), /own descendant/);
  assert.throws(() => doc.group('bad', ['g', 'nested']), /own descendant/);
  assert.throws(() => doc.add(factory.create('g', 'g', [])), /id already exists/);
  doc.add(factory.create('g', 'G', []));
  doc.front('g'); assert.deepEqual(doc.children.map(n => n.id), ['G', 'g']);
  doc.back('g'); assert.deepEqual(doc.children.map(n => n.id), ['g', 'G']);
  const copy = doc.clone(); copy.delete('g');
  assert.equal(copy.has('nested'), false);
  assert.equal(doc.has('nested'), true);
});

test('numeric validation and whitelist reject invalid values', () => {
  const r = factory.create('rect', 'r', ['1.5', '-2', '0', '4']);
  assert.throws(() => r.scale(0), /scale factor must be positive/);
  assert.throws(() => r.set('width', '-1'), /nonnegative/);
  assert.throws(() => r.set('x', 'NaN'), /invalid/);
  assert.throws(() => r.set('font-size', '12'), /unknown attribute/);
  assert.throws(() => new SvgDocument(0, 2), /width must be positive/);
});
