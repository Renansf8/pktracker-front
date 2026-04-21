import { FlatCompat } from "@eslint/eslintrc";

/**
 * ESLint flat config usando o eslint-config-next via FlatCompat.
 * Substitui a config anterior que dependia de eslint-plugin-react-refresh
 * (específico do Vite).
 */
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "node_modules/**"],
  },
];
