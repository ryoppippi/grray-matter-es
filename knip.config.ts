import type { KnipConfig } from "knip";

export default {
  project: ["src/**/*.ts"],
  ignoreBinaries: ["oxfmt", "oxlint", "tsgo", "only-allow"],
  rules: {
    devDependencies: "warn",
  },
} satisfies KnipConfig;
