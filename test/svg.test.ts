import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SvgCodec } from '../src/infrastructure/SvgCodec.js';
import { FileDocumentStore } from '../src/infrastructure/FileDocumentStore.js';
import { EditorSession } from '../src/application/EditorSession.js';
import { CommandRunner } from '../src/cli/CommandRunner.js';
import { TreeView } from '../src/application/TreeView.js';

const codec = new SvgCodec();
test('SVG round trip preserves hierarchy, all six types, Unicode and XML escapes', () => {
  const xml = '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><g id="g" fill="red"><rect id="r" x="1.5" y="2" width="3" height="4"/><circle id="c" cx="2" cy="3" r="1"/><ellipse id="e" cx="1" cy="2" rx="3" ry="4"/><line id="l" x1="1" y1="2" x2="3" y2="4" stroke="black"/><text id="t" x="1" y="2">开始 &amp; &lt;end&gt; "quote"</text></g></svg>';
  const a = codec.decode(xml).document;
  const encoded = codec.encode(a);
  assert.match(encoded, /&amp; &lt;end/);
  const b = codec.decode(encoded).document;
  assert.deepEqual(new TreeView().render(a), new TreeView().render(b));
  assert.equal(b.find('t').textContent, '开始 & <end> "quote"');
  assert.equal(b.all().length, 6);
});

test('automatic ids reserve all explicit ids, including later nodes', () => {
  const result = codec.decode('<svg><g><rect/><rect id="rect1"/><rect/><circle/></g></svg>');
  assert.deepEqual(result.document.all().map(n => n.id), ['g1', 'rect2', 'rect1', 'rect3', 'circle1']);
  assert.equal(result.warnings.length, 4);
  assert.ok(result.warnings.includes('warning: assigned id rect2 to unnamed <rect>'));
});

test('malformed/unsupported SVG and duplicate ids are rejected', () => {
  const invalid = [
    '<svg><g></svg>', '<svg><rect id="a"/><circle id="a"/></svg>', '<html/>',
    '<svg><path id="p"/></svg>', '<svg><text id="t"><g id="g"/></text></svg>',
    '<!DOCTYPE svg [<!ENTITY x "bad">]><svg/>', '<svg width="NaN"/>',
    '<svg width="10" height="10" viewBox="0 0 100 100"/>',
  ];
  for (const source of invalid) assert.throws(() => codec.decode(source), source);
});

test('file store round trip, default path, failed read and write preserve active document', () => {
  const dir = mkdtempSync(join(tmpdir(), 'svg-editor-'));
  try {
    const path = join(dir, 'my drawing.svg');
    const session = new EditorSession(new FileDocumentStore());
    const run = new CommandRunner(session);
    run.run('init'); run.run('create circle c 1 2 3 red');
    assert.match(run.run(`save "${path}"`)[0], /^saved/);
    run.run('move c 1 1'); run.run('save');
    assert.match(readFileSync(path, 'utf8'), /cx="2"/);
    run.run(`read "${path}"`);
    run.run('move c 1 0');
    const before = run.run('tree');
    assert.match(run.run(`save "${join(dir, 'missing', 'a.svg')}"`)[0], /^error: cannot write file:/);
    writeFileSync(join(dir, 'bad.svg'), '<svg><broken></svg>');
    assert.match(run.run(`read "${join(dir, 'bad.svg')}"`)[0], /^error:/);
    assert.deepEqual(run.run('tree'), before);
    run.run('undo'); assert.equal(session.document.find('c').attributes().get('cx'), '2');
    assert.equal(readdirSync(dir).some(name => name.endsWith('.tmp')), false);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
