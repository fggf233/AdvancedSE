import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const result = spawnSync(process.execPath, ['dist/src/main.js'], {
  input: readFileSync(process.argv[2] || 'examples/flowchart.commands', 'utf8'),
  encoding: 'utf8',
});
process.stdout.write(result.stdout ?? '');
process.stderr.write(result.stderr ?? '');
process.exitCode = result.status ?? 1;
