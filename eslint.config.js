// @ts-check
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

/**
 * Donely has no dedicated design-system layer for style props, so the project
 * enforces "Tailwind classes only" for JSX styling. There is no published
 * ESLint rule with this exact behavior, so it's authored here as a tiny custom
 * rule and merged into the `react` plugin's rule set under the name
 * `no-inline-styles` — this matches the `react/no-inline-styles` id already
 * used throughout the codebase's `eslint-disable` comments for documented
 * dynamic cases (map pins, computed gradients/transforms, per-prop colors).
 * @type {import('eslint').Rule.RuleModule}
 */
const noInlineStyles = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow the JSX `style` prop; use Tailwind utility classes instead.',
    },
    schema: [],
    messages: {
      noInlineStyles:
        'Inline `style` prop is not allowed — use Tailwind classes. If this is a genuinely dynamic value Tailwind cannot express statically, add `// eslint-disable-line react/no-inline-styles -- <reason>`.',
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.type === 'JSXIdentifier' && node.name.name === 'style') {
          context.report({ node, messageId: 'noInlineStyles' });
        }
      },
    };
  },
};

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'src/api/schema.d.ts'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      react: {
        ...reactPlugin,
        rules: {
          ...reactPlugin.rules,
          'no-inline-styles': noInlineStyles,
        },
      },
      // Registered (not enabled) so the pre-existing `eslint-disable-next-line
      // react-hooks/exhaustive-deps` comments left by earlier phases resolve to a
      // known rule instead of erroring as "not found". Turning the rule itself on
      // is out of scope for this task (Task 4.3 = react/no-inline-styles only).
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'react/no-inline-styles': 'error',
    },
  },
];
