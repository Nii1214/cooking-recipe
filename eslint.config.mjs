import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// =============================================================================
// クリーンアーキテクチャ import 制限（保守性のため定義を一元化）
// 詳細: docs/guides/eslint-clean-architecture.md
// =============================================================================

const LAYER_FILES = [
  "src/**/*.ts",
  "src/**/*.tsx",
  "src/**/*.js",
  "src/**/*.jsx",
  "src/**/*.mjs",
];

/** 層ごとの glob。path は src/ からの相対 */
const layer = (path) =>
  LAYER_FILES.map((f) => f.replace("src/**", path));

/** path と message の配列から no-restricted-imports の patterns を生成 */
const pathGroup = (pathSpec, message) => ({
  group: [pathSpec, `${pathSpec}/*`],
  message,
});

// 各層で禁止する import（重複を避けるためここで定義）
const FORBIDDEN = {
  domain: [
    pathGroup("@/app", "domain は app に依存できません（クリーンアーキテクチャ）"),
    pathGroup("@/presentation", "domain は presentation に依存できません（クリーンアーキテクチャ）"),
    pathGroup("@/usecase", "domain は usecase に依存できません（クリーンアーキテクチャ）"),
    pathGroup("@/infrastructure", "domain は infrastructure に依存できません（クリーンアーキテクチャ）"),
    pathGroup("@/lib", "domain は lib に依存できません（クリーンアーキテクチャ）"),
    pathGroup("@/types", "domain は types に依存できません。ドメインは自己完結させてください（クリーンアーキテクチャ）"),
    pathGroup("@/utils", "domain は utils に依存できません。ドメインは自己完結させてください（クリーンアーキテクチャ）"),
    pathGroup("@/constants", "domain は constants に依存できません。ドメインは自己完結させてください（クリーンアーキテクチャ）"),
  ],
  usecase: [
    pathGroup("@/app", "usecase は app に依存できません（クリーンアーキテクチャ）"),
    pathGroup("@/presentation", "usecase は presentation に依存できません（クリーンアーキテクチャ）"),
    pathGroup("@/infrastructure", "usecase は infrastructure に依存できません。実装は deps で受け取ってください（クリーンアーキテクチャ）"),
    pathGroup("@/lib", "usecase は lib（Supabase 等）に直接依存できません。リポジトリ経由で利用してください（クリーンアーキテクチャ）"),
  ],
  infrastructure: [
    pathGroup("@/app", "infrastructure は app に依存できません（クリーンアーキテクチャ）"),
    pathGroup("@/presentation", "infrastructure は presentation に依存できません（クリーンアーキテクチャ）"),
    pathGroup("@/usecase", "infrastructure は usecase に依存できません（クリーンアーキテクチャ）"),
  ],
  presentation: [
    pathGroup("@/usecase", "presentation は usecase を直接 import できません。Server Action（app）を呼び、app 層で usecase を実行してください（クリーンアーキテクチャ）"),
    pathGroup("@/infrastructure", "presentation は infrastructure を直接 import できません。app 層を経由してください（クリーンアーキテクチャ）"),
    pathGroup("@/lib", "presentation は lib（Supabase 等）を直接 import できません。app 層を経由してください（クリーンアーキテクチャ）"),
  ],
};

/** no-restricted-imports ルールを生成。severity: "error" | "warn" */
const restrictedImportRule = (patterns, severity = "warn") => [
  severity,
  { patterns },
];

// =============================================================================

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // ドキュメント用サンプルコード（lintの対象外）
    "docs/**",
  ]),
  // ---------- domain: 最内層。他層・shared に依存しない（error で厳格化）
  {
    files: layer("src/domain/**"),
    rules: {
      "no-restricted-imports": restrictedImportRule(FORBIDDEN.domain, "error"),
    },
  },
  // ---------- usecase: domain と types/utils/constants のみ。infra は deps（error で厳格化）
  {
    files: layer("src/usecase/**"),
    rules: {
      "no-restricted-imports": restrictedImportRule(FORBIDDEN.usecase, "error"),
    },
  },
  // ---------- infrastructure: domain と lib のみ
  {
    files: layer("src/infrastructure/**"),
    rules: {
      "no-restricted-imports": restrictedImportRule(FORBIDDEN.infrastructure, "warn"),
    },
  },
  // ---------- presentation: app / domain（型） / types 可。usecase / infra / lib は app 経由
  {
    files: layer("src/presentation/**"),
    rules: {
      "no-restricted-imports": restrictedImportRule(FORBIDDEN.presentation, "warn"),
    },
  },
]);

export default eslintConfig;
