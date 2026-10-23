import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EditorSession } from '../src/application/EditorSession.js';
import { Argument } from '../src/commands/Argument.js';
import { Arguments } from '../src/commands/Arguments.js';
import { CreateCommand } from '../src/commands/CreateCommand.js';
import { MoveCommand } from '../src/commands/MoveCommand.js';
import { ScaleCommand } from '../src/commands/ScaleCommand.js';
import { GroupCommand } from '../src/commands/GroupCommand.js';
import { DeleteCommand } from '../src/commands/DeleteCommand.js';
import { MemoryStore } from './MemoryStore.js';

const args = (...values: string[]) => new Arguments(values.map(v => new Argument(v)));
const setup = () => { const s = new EditorSession(new MemoryStore()); s.init(800, 600); return s; };

test('one group is one undo unit, redo restores tree and fresh edit clears redo', () => {
  const s = setup();
  new CreateCommand(args('rect', 'r', '0', '0', '10', '10')).execute(s);
  new CreateCommand(args('circle', 'c', '5', '5', '2')).execute(s);
  new GroupCommand(args('g', 'r', 'c')).execute(s);
  s.undo(); assert.deepEqual(s.document.children.map(n => n.id), ['r', 'c']);
  s.redo(); assert.deepEqual(s.document.find('g').children.map(n => n.id), ['r', 'c']);
  s.undo(); new MoveCommand(args('r', '10', '0')).execute(s);
  assert.throws(() => s.redo(), /nothing to redo/);
});

test('failed operations preserve current state and redo stack', () => {
  const s = setup();
  new CreateCommand(args('rect', 'r', '0', '0', '10', '10')).execute(s);
  new MoveCommand(args('r', '2', '0')).execute(s); s.undo();
  const old = s.document;
  assert.throws(() => new ScaleCommand(args('r', '-1')).execute(s), /positive/);
  assert.equal(s.document, old);
  assert.throws(() => s.read('missing'), /cannot read/);
  assert.throws(() => s.save('fail.svg'), /cannot write/);
  s.redo(); assert.equal(s.document.find('r').attributes().get('x'), '2');
});

test('late recursive overflow rolls back changes to earlier siblings', () => {
  const s = setup();
  new CreateCommand(args('g', 'g')).execute(s);
  new CreateCommand(args('circle', 'a', '1', '1', '1', 'in', 'g')).execute(s);
  new CreateCommand(args('circle', 'b', '1e308', '1', '1', 'in', 'g')).execute(s);
  assert.throws(() => new ScaleCommand(args('g', '10')).execute(s), /invalid number/);
  assert.equal(s.document.find('a').attributes().get('cx'), '1');
});

test('save/read/init/resize lock history; query and failed operations do not', () => {
  const s = setup();
  new CreateCommand(args('g', 'g')).execute(s);
  s.canvas(); s.undo(); assert.equal(s.document.has('g'), false); s.redo();
  s.save('ok.svg'); assert.throws(() => s.undo(), /not allowed after io/);
  assert.throws(() => new MoveCommand(args('missing', '1', '2')).execute(s));
  assert.throws(() => s.redo(), /not allowed after io/);
  new MoveCommand(args('g', '1', '2')).execute(s); s.undo();
  assert.throws(() => s.undo(), /nothing to undo/);
  s.read('ok.svg'); assert.throws(() => s.redo(), /not allowed after io/);
  new DeleteCommand(args('g')).execute(s); s.undo(); assert.equal(s.document.has('g'), true);
  s.canvas(100, 100); assert.throws(() => s.undo(), /not allowed after io/);
  s.init(200, 200); assert.equal(s.document.all().length, 0);
});
