// Realce de sintaxe mínimo para Python, linha a linha.

const KEYWORDS = new Set([
  'False',
  'None',
  'True',
  'and',
  'as',
  'assert',
  'break',
  'class',
  'continue',
  'def',
  'del',
  'elif',
  'else',
  'except',
  'finally',
  'for',
  'from',
  'global',
  'if',
  'import',
  'in',
  'is',
  'lambda',
  'nonlocal',
  'not',
  'or',
  'pass',
  'raise',
  'return',
  'try',
  'while',
  'with',
  'yield',
]);

const BUILTINS = new Set([
  'print',
  'input',
  'range',
  'len',
  'str',
  'int',
  'float',
  'list',
  'dict',
  'set',
  'sum',
  'min',
  'max',
  'abs',
  'sorted',
  'enumerate',
  'zip',
  'map',
  'filter',
  'open',
  'round',
]);

const TOKEN = /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|(\s+|.)/g;

export function tokenize(line) {
  const tokens = [];
  for (const m of line.matchAll(TOKEN)) {
    let type = 'plain';
    if (m[1]) type = 'comment';
    else if (m[2]) type = 'string';
    else if (m[3]) type = 'number';
    else if (m[4]) type = KEYWORDS.has(m[4]) ? 'keyword' : BUILTINS.has(m[4]) ? 'builtin' : 'plain';

    const last = tokens[tokens.length - 1];
    if (last && last.type === type && type === 'plain') last.text += m[0];
    else tokens.push({ text: m[0], type });
  }
  return tokens;
}
