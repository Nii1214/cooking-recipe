import { RecipeDetailView } from "@/presentation/components/recipe/RecipeDetailView";
import { getRecipeById } from "@/infrastructure/repositories/recipe/recipe-read-repository-impl";
import { getRecipeDetailUsecase } from "@/usecase/recipe/get-recipe-detail-usecase";
import { getPresignedImageUrl } from "@/lib/get-presigned-image-url";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params;

  let recipe: Awaited<ReturnType<typeof getRecipeDetailUsecase>>;
  try {
    recipe = await getRecipeDetailUsecase(id, { getRecipeById });
  } catch {
    notFound();
  }

  const thumbnailUrl = recipe.thumbnailPath
    ? await getPresignedImageUrl(recipe.thumbnailPath)
    : undefined;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="w-full max-w-3xl mx-auto px-4 py-6">
        <RecipeDetailView recipe={recipe} thumbnailUrl={thumbnailUrl} />
      </div>
    </div>
  );
}
