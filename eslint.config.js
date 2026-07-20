// @ts-check
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import boundariesPlugin from 'eslint-plugin-boundaries';

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

/**
 * Task 5.3 — import boundaries between the app's four independent "surfaces"
 * (admin CRM, marketing landing, mobile customer app, mobile provider/"pro" app).
 * Each surface may freely import shared code (src/components, src/lib, src/api,
 * src/state, src/i18n — plus a few other surface-neutral folders like src/desktop
 * and top-level app bootstrap files, which fall into the same `shared` bucket
 * below) and its own internals, but must not reach into another surface's
 * internal folders (e.g. admin/sections/* importing mobile/screens/*).
 *
 * Five files are the actual composition roots that legitimately mount one
 * surface from another — this is pre-existing, intentional architecture, not a
 * layering mistake:
 *   - src/main.tsx            → app bootstrap; also bulk-imports landing.css
 *   - src/App.tsx             → routes to AdminApp / AuthPage+Subpage(landing) / MobileApp
 *   - src/mobile/MobileApp.tsx → renders <Landing/> for logged-out visitors and
 *                                mounts <ProApp/>/<ProNav/> for pro-mode users
 *   - src/mobile/pro/ProApp.tsx → reuses the customer `ProfileTab` for /pro/profile
 *     (mirrored by ProNav.tsx living alongside it)
 * These five are typed `app-shell` (checked first, so they don't also pick up
 * their folder's normal type) and are the only files allowed to depend on more
 * than one surface at once.
 */
const boundariesElements = [
  {
    type: 'app-shell',
    mode: 'full',
    pattern: ['src/main.tsx', 'src/App.tsx', 'src/mobile/MobileApp.tsx', 'src/mobile/pro/ProApp.tsx', 'src/mobile/pro/ProNav.tsx'],
  },
  { type: 'admin', mode: 'full', pattern: 'src/admin/**' },
  { type: 'landing', mode: 'full', pattern: 'src/landing/**' },
  // mobile-pro must be listed before the broader mobile pattern below, since
  // `boundaries/elements-single-type` makes the first matching entry win.
  { type: 'mobile-pro', mode: 'full', pattern: 'src/mobile/pro/**' },
  { type: 'mobile', mode: 'full', pattern: 'src/mobile/**' },
  { type: 'shared', mode: 'full', pattern: 'src/**' },
];

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
      boundaries: boundariesPlugin,
    },
    settings: {
      'boundaries/elements': boundariesElements,
      // A file matches exactly one element type (the first pattern that hits),
      // rather than accumulating every type whose glob happens to match.
      'boundaries/elements-single-type': true,
    },
    rules: {
      'react/no-inline-styles': 'error',
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'app-shell', allow: ['app-shell', 'admin', 'landing', 'mobile', 'mobile-pro', 'shared'] },
            { from: 'admin', allow: ['admin', 'shared'] },
            { from: 'landing', allow: ['landing', 'shared'] },
            { from: 'mobile', allow: ['mobile', 'shared'] },
            { from: 'mobile-pro', allow: ['mobile-pro', 'shared'] },
            { from: 'shared', allow: ['shared'] },
          ],
        },
      ],
    },
  },
];
