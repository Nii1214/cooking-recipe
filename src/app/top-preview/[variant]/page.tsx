import { notFound } from "next/navigation";
import { TopPreviewScreen } from "@/presentation/components/recipe/previews/TopPreviewScreen";
import { TOP_PREVIEW_VARIANTS } from "@/presentation/components/recipe/previews/top-preview-variants";

type Props = {
  params: Promise<{ variant: string }>;
};

/**
 * 各ヒーロー案を静的に生成するためのパラメータ一覧
 * @returns スラッグの一覧
 */
export function generateStaticParams() {
  return TOP_PREVIEW_VARIANTS.map(({ slug }) => ({ variant: slug }));
}

export default async function TopPreviewVariantPage({ params }: Props) {
  const { variant } = await params;

  const isKnownVariant = TOP_PREVIEW_VARIANTS.some(
    (item) => item.slug === variant,
  );
  if (!isKnownVariant) {
    notFound();
  }

  return <TopPreviewScreen slug={variant} />;
}
