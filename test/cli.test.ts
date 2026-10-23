import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { EditorSession } from '../src/application/EditorSession.js';
import { CommandRunner } from '../src/cli/CommandRunner.js';
import { Tokenizer } from '../src/cli/Tokenizer.js';
import { MemoryStore } from './MemoryStore.js';

const setup = () => {
  const session = new EditorSession(new MemoryStore());
  const runner = new CommandRunner(session);
  return { session, run: (line: string) => runner.run(line).join('\n') };
};

test('tokenizer handles colors, comments, quoted in, Windows paths and empty strings', () => {
  const lexer = new Tokenizer();
  assert.deepEqual(lexer.tokenize('  # comment'), []);
  assert.deepEqual(lexer.tokenize('set t text ""').map(t => t.value), ['set', 't', 'text', '']);
  assert.equal(lexer.tokenize('read "C:\\my files\\a.svg"')[1].value, 'C:\\my files\\a.svg');
  assert.equal(lexer.tokenize('create rect r 0 0 1 1 #fff').at(-1)!.value, '#fff');
  assert.throws(() => lexer.tokenize('set t text "oops'), /unterminated/);
  const { run, session } = setup(); run('init'); run('create g scene');
  assert.doesNotMatch(run('create text t 0 0 "in" in scene'), /^error:/);
  assert.equal(session.document.find('t').textContent, 'in');
});

test('all commands execute and undo nested tree mutations', () => {
  const { run, session } = setup();
  assert.match(run('help'), /create ellipse/);
  assert.equal(run('tree'), "error: no document. use 'init' or 'read' first");
  const lines = ['init 800 600', 'create g scene', 'create g sub in scene',
    'create rect r 1 2 3 4 red in sub', 'create circle c 1 2 3 in scene',
    'create ellipse e 1 2 3 4', 'create line l 1 2 3 4 black',
    'create text t 1 2 "hello world" in sub', 'set r stroke-width 2',
    'set t text "new text"', 'move sub 2 3', 'scale sub 2', 'show r', 'tree scene',
    'addto scene e', 'group pair c e', 'ungroup pair', 'undo', 'redo',
    'front c', 'back c', 'delete sub', 'undo', 'redo', 'undo', 'save test.svg', 'read test.svg', 'canvas', 'canvas 300 200'];
  for (const line of lines) assert.doesNotMatch(run(line), /^error:/, line);
  assert.equal(session.document.width, 300);
  assert.equal(session.document.find('r').attributes().get('x'), '6');
  assert.equal(session.document.find('t').textContent, 'new text');
  assert.match(run('tree'), /├──|└──/);
});

test('required errors are precise and all failures preserve tree and history', () => {
  const { run } = setup();
  run('init'); run('create g scene'); run('create g child in scene'); run('create rect r 0 0 1 1');
  const before = run('tree');
  const cases = [
    ['create g r', 'id already exists: r'], ['delete missing', 'no such shape: missing'],
    ['create g a in missing', 'no such container: missing'], ['create g a in r', 'not a container: r'],
    ['create box n 1 2 3 4 "hi"', 'unknown shape type: box (is the plugin loaded?)'],
    ['group bad scene child', 'cannot group a container into its own descendant: scene'],
    ['ungroup scene', 'cannot ungroup top-level container: scene'],
    ['scale r 0', 'scale factor must be positive'], ['set r id new', 'unknown attribute: id'],
  ];
  for (const [line, expected] of cases) {
    assert.equal(run(line), `error: ${expected}`);
    assert.equal(run('tree'), before);
  }
  run('undo'); assert.doesNotMatch(run('tree'), /rect#r/);
});

test('real CLI reads stdin, continues after error and exits on EOF', () => {
  const result = spawnSync(process.execPath, ['dist/src/main.js'], {
    encoding: 'utf8', input: '# comment\ninit\ncreate text t 0 0 "开始 & end"\ninvalid\ntree\n', timeout: 10000,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /svg-editor 0.1/);
  assert.match(result.stdout, /error: unknown command: invalid/);
  assert.match(result.stdout, /text#t.*开始 & end/);
  assert.equal(result.stderr, '');
});

test('each structural edit restores exact tree, parent, style and sibling ordering', () => {
  const edits = ['addto right a', 'group bundle b a', 'ungroup left', 'front a', 'back b',
    'delete left', 'set left fill blue', 'set a width 12.5', 'move scene -3 1.25', 'scale scene 0.5'];
  for (const edit of edits) {
    const { run } = setup();
    for (const line of ['init', 'create g scene', 'create g left in scene', 'create g right in scene',
      'create rect a 1 2 3 4 red in left', 'create rect b 5 6 7 8 green in left',
      'create text t 0 0 "hello" in right']) assert.doesNotMatch(run(line), /^error:/);
    const before = run('tree');
    assert.doesNotMatch(run(edit), /^error:/, edit);
    const after = run('tree');
    run('undo'); assert.equal(run('tree'), before, `undo ${edit}`);
    run('redo'); assert.equal(run('tree'), after, `redo ${edit}`);
  }
});

test('cross-parent group uses common ancestor and original document order', () => {
  const { run, session } = setup();
  for (const line of ['init', 'create g scene', 'create g left in scene', 'create g right in scene',
    'create circle a 1 2 3 in left', 'create circle b 4 5 6 in right']) run(line);
  const before = run('tree');
  assert.doesNotMatch(run('group both b a'), /^error:/);
  assert.equal(session.document.find('both').parent!.id, 'scene');
  assert.deepEqual(session.document.find('both').children.map(n => n.id), ['a', 'b']);
  run('undo'); assert.equal(run('tree'), before);
});
