import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';

test('production classes follow file naming and planned dependency directions', () => {
  const allowed: Record<string, string[]> = {
    domain: ['domain'], application: ['application', 'domain'],
    commands: ['commands', 'application', 'domain'],
    cli: ['cli', 'commands', 'application'],
    infrastructure: ['infrastructure', 'application', 'domain'],
  };
  for (const [layer, dependencies] of Object.entries(allowed)) {
    for (const filename of readdirSync(join('src', layer)).filter(file => file.endsWith('.ts'))) {
      const path = join('src', layer, filename);
      const source = readFileSync(path, 'utf8');
      // This repository uses direct imports and named class declarations. This is
      // a convention guard, not a general TypeScript semantic dependency analyzer.
      const classes = [...source.matchAll(/^export (?:abstract )?class (\w+)/gmu)];
      assert.ok(classes.length <= 1, path);
      for (const declaration of classes) assert.equal(declaration[1], basename(filename, '.ts'), path);
      assert.doesNotMatch(source, /^(?:export )?function /mu, `free production function: ${path}`);
      for (const match of source.matchAll(/from ['"]([^'"]+)['"]/gu)) {
          const specifier = match[1];
          if (specifier.startsWith('../')) assert.ok(dependencies.includes(specifier.split('/')[1]), `${path} -> ${specifier}`);
          else if (!specifier.startsWith('.')) {
            assert.ok(['cli', 'infrastructure'].includes(layer), `external dependency: ${path} -> ${specifier}`);
          }
      }
      assert.doesNotMatch(source, /\bswitch\s*\(/u, `switch dispatch outside tables: ${path}`);
    }
  }
});
