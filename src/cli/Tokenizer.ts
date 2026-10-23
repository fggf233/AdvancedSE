import { Argument } from '../commands/Argument.js';
export class Tokenizer {
  tokenize(line: string): Argument[] {
    if (!line.trim() || line.trimStart().startsWith('#')) return [];
    const result: Argument[] = [];
    let index = 0;
    while (index < line.length) {
      if (/\s/u.test(line[index])) { index++; continue; }
      let value = '';
      const quoted = line[index] === '"';
      if (quoted) {
        index++;
        while (index < line.length && line[index] !== '"') {
          if (line[index] === '\\' && ['"', '\\'].includes(line[index + 1])) index++;
          value += line[index++];
        }
        if (index === line.length) throw new Error('unterminated quoted argument');
        index++;
        if (index < line.length && !/\s/u.test(line[index])) throw new Error('expected whitespace after quote');
      } else {
        while (index < line.length && !/\s/u.test(line[index])) {
          if (line[index] === '"') throw new Error('quote must start an argument');
          value += line[index++];
        }
      }
      result.push(new Argument(value, quoted));
    }
    return result;
  }
}
