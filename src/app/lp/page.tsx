import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LP_PREVIEW_THEMES } from "@/presentation/components/landing/previews/lp-preview-themes";

/**
 * LP デザイン案の一覧ページ。各テーマの検証ルートへの入口。
 *
 * @returns テーマ一覧
 */
export default function LpPreviewIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs font-semibold tracking-wider text-emerald-700">
          社内検証用
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
          LP デザイン案
        </h1>
        <p className="mt-3 leading-relaxed text-gray-600">
          マテリアル案の採用が決まり、その内容は本番 LP（
          <Link href="/" className="underline hover:text-gray-900">
            トップページ
          </Link>
          ）へ反映済みです。以下は不採用となった案で、比較用に残しています。
        </p>

        <div className="mt-10 space-y-4">
          {LP_PREVIEW_THEMES.map((theme) => (
            <Link
              key={theme.slug}
              href={`/lp/${theme.slug}`}
              className="group flex gap-5 rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-emerald-300 hover:shadow-md"
            >
              <span
                aria-hidden
                className={`h-20 w-20 shrink-0 rounded-lg border border-gray-100 ${theme.swatchClassName}`}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-gray-900">
                    {theme.name}
                  </h2>
                  <ArrowRight className="h-4 w-4 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                </div>
                <p className="mt-0.5 text-xs font-medium text-emerald-700">
                  {theme.concept}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {theme.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-dashed border-gray-300 p-5 text-sm leading-relaxed text-gray-500">
          いずれも現行 LP と同じ導線（新規登録・ログイン・ゲストで試す）を持ち、未実装の機能（招待・編集・削除など）には触れていません。採用案が決まったら、その内容を{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700">
            LandingPage.tsx
          </code>{" "}
          に反映し、この検証ルートは削除します。
        </div>
      </div>
    </div>
  );
}
