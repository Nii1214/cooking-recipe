import { QuickAccessSection } from "../TopHero";
import { ConceptHero } from "./ConceptHero";
import { PreviewRecipeList } from "./PreviewRecipeList";
import { TOP_PREVIEW_VARIANTS } from "./top-preview-variants";

/** 見本として表示する登録レシピ件数 */
const SAMPLE_RECIPE_COUNT = 24;

type Props = {
  slug: string;
};

/**
 * コピー案 1 つ分の TOP 画面プレビュー。
 * デザインは現行のままで、ヒーローの文言だけが案ごとに変わる。
 *
 * @param slug 表示するコピー案のスラッグ
 * @returns プレビュー画面。未知のスラッグの場合は null
 */
export function TopPreviewScreen({ slug }: Props) {
  const variant = TOP_PREVIEW_VARIANTS.find((item) => item.slug === slug);

  if (!variant) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 pb-24">
      <ConceptHero
        recipeCount={SAMPLE_RECIPE_COUNT}
        headline={variant.headline}
        bodyLines={variant.bodyLines}
      />
      <QuickAccessSection />

      <PreviewRecipeList />

      <div className="w-full max-w-5xl mx-auto px-4">
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6">
          <p className="text-xs font-medium text-gray-400">
            この案について（プレビュー用の説明）
          </p>
          <h2 className="mt-1 text-base font-bold text-gray-900">
            {variant.name} — {variant.concept}
          </h2>
          <p className="mt-2 text-sm text-gray-700 leading-relaxed">
            {variant.description}
          </p>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            向いているケース: {variant.suitedFor}
          </p>
        </div>
      </div>
    </div>
  );
}
