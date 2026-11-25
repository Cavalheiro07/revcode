// ESLint do backend (flat config). Regras recomendadas do JS e do TypeScript, mais as de Clean Code que o
// grupo decidiu cobrar; a formatação fica com o Prettier (eslint-config-prettier desliga as regras de estilo).
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', 'node_modules/', 'prisma/migrations/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: globals.node },
    rules: {
      // Clean Code: funções pequenas, poucos parâmetros, pouco aninhamento, sem números soltos.
      'max-params': ['error', 4],
      'max-depth': ['error', 3],
      complexity: ['warn', 12],
      'no-magic-numbers': 'off',
      eqeqeq: ['error', 'always'],
      'no-else-return': 'error',
      'prefer-const': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  prettier,
);
