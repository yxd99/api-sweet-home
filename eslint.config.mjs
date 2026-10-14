import js from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Flat config for ESLint 10. Replaces the ESLint 8 `.eslintrc.js`, which
// ESLint 10 no longer reads.
//
// Preset mapping (eslintrc -> flat):
//   'airbnb-base'                       -> dropped, see the note below
//   'plugin:@typescript-eslint/recommended' -> tseslint.configs.recommended
//   'plugin:sonarjs/recommended'        -> sonarjs.configs.recommended
//   'plugin:prettier/recommended'       -> prettierRecommended (last)
//   eslint:recommended (via airbnb)     -> js.configs.recommended
//   plugins: [import]                   -> eslint-plugin-import-x
//
// `eslint-config-airbnb-base` 15.0.0 exports no flat config and its peer range
// is `eslint: ^7.32.0 || ^8.2.0`, so it cannot be carried to ESLint 10.
// `eslint-plugin-import` tops out at `eslint: ^9`; its maintained flat-first
// fork `eslint-plugin-import-x` supports `^10` and keeps the same rule names
// under the `import-x/` prefix.
export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'jest.config.js'],
  },

  js.configs.recommended,
  tseslint.configs.recommended,
  importX.flatConfigs.recommended,
  // Adds the `import-x/resolver` -> `eslint-import-resolver-typescript`
  // resolution the eslintrc config had under `settings['import/resolver']`,
  // plus the TS extensions list.
  importX.flatConfigs.typescript,
  sonarjs.configs.recommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      'no-useless-constructor': 'off',
      'no-empty-function': ['error', { allow: ['constructors'] }],
      'import-x/prefer-default-export': 'off',
      'no-restricted-imports': [
        'error',
        {
          patterns: ['../*'],
        },
      ],
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['sibling', 'parent'],
            'index',
            'unknown',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import-x/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          ts: 'never',
        },
      ],
      'class-methods-use-this': 'off',
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: ['**/*.spec.ts', 'test/**/*'],
        },
      ],
      'import-x/no-useless-path-segments': 'error',
      'import-x/exports-last': 'off',
      'import-x/group-exports': 'off',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': ['error'],
    },
  },

  prettierRecommended,
);
