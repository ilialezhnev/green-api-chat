// ESLint is used only for code-layout rules that Prettier can't enforce (and oxlint doesn't have).
// Bug-finding rules live in oxlint (.oxlintrc.json), formatting itself is Prettier's job.
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

const ALWAYS = 'always';
const VARIABLES = ['const', 'let', 'var'];

export default [
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: tseslint.parser },
    plugins: { '@stylistic': stylistic },
    rules: {
      // `if (x) return y` -> `if (x) { return y; }`, also for else/for/while.
      curly: ['error', 'all'],
      '@stylistic/padding-line-between-statements': [
        'error',
        // Imports are separated from the code below them.
        { blankLine: ALWAYS, prev: 'import', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' },
        // if/else, loops, try, switch, functions and other block statements stand apart.
        { blankLine: ALWAYS, prev: '*', next: 'block-like' },
        { blankLine: ALWAYS, prev: 'block-like', next: '*' },
        // A group of variables is followed by a blank line, but the group itself stays compact.
        { blankLine: ALWAYS, prev: VARIABLES, next: '*' },
        { blankLine: 'any', prev: VARIABLES, next: VARIABLES },
        // Multi-line calls (useEffect, dispatch, ...) and declarations stand apart.
        { blankLine: ALWAYS, prev: '*', next: 'multiline-expression' },
        { blankLine: ALWAYS, prev: 'multiline-expression', next: '*' },
        { blankLine: ALWAYS, prev: '*', next: ['interface', 'type'] },
        { blankLine: ALWAYS, prev: ['interface', 'type'], next: '*' },
        // The result is separated from the logic above it.
        { blankLine: ALWAYS, prev: '*', next: 'return' },
      ],
    },
  },
];
