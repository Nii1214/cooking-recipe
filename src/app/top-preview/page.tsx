import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TOP_PREVIEW_VARIANTS } from "@/presentation/components/recipe/previews/top-preview-variants";

/**
 * TOP 画面ヒーローのコピー案の一覧ページ。各案の検証ルートへの入口。
 *
 * @returns コピー案の一覧
 */
export default function TopPreviewIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs font-semibold tracking-wider text-emerald-700">
          社内検証用
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
          TOP ヒーローのコピー案
        </h1>
        <p className="mt-4 leading-relaxed text-gray-700">
          ログイン後の{" "}
          <Link href="/top" className="underline hover:text-gray-900">
            /top
          </Link>{" "}
          のヒーローについて、デザインは変えずに見出しと本文だけを差し替えた案の比較です。「実用」案の採用が決まり、その内容は
          /top へ反映済みです。以下は比較用に残しています。
        </p>

        <div className="mt-8 space-y-4">
          {TOP_PREVIEW_VARIANTS.map((variant) => (
            <Link
              key={variant.slug}
              href={`/top-preview/${variant.slug}`}
              className="group block rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">
                  {variant.name}
                </h2>
                <ArrowRight className="h-4 w-4 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-600" />
              </div>
              <p className="mt-0.5 text-xs font-medium text-emerald-700">
                {variant.concept}
              </p>

              <div className="mt-4 border-l-2 border-emerald-100 pl-4">
                <p className="font-serif text-lg font-bold tracking-wide text-gray-900">
                  {variant.headline}
                </p>
                {variant.bodyLines.length > 0 && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                    {variant.bodyLines.join("")}
                  </p>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-gray-500">
                {variant.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-6 text-sm leading-relaxed text-gray-500">
          採用案が決まったら、その文言を{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700">
            TopHero.tsx
          </code>{" "}
          に反映し、この検証ルートは削除します。
        </div>
      </div>
    </div>
  );
}
