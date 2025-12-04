import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'dist',
      'dist/**',
      'node_modules',
      'node_modules/**',
      'scripts/**',
      'coverage',
      'coverage/**',
      '**/*.spec.ts',
      '**/*.e2e-spec.ts',
      'test',
      'test/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      "@typescript-eslint/no-unused-vars": ["error"],
      '@typescript-eslint/require-await': 'off',
      "@typescript-eslint/explicit-module-boundary-types": "off",
      'no-console': 'error',
      'eqeqeq': ['error', 'always'],
      'prettier/prettier': 'error',
    },
  },
);