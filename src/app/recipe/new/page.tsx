import { RecipeCreateForm } from "@/presentation/components/recipe/RecipeCreateForm";

export default function Page() {
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
            <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">レシピ登録</h1>
                <p className="text-sm text-gray-600">家族で共有・継承できるレシピを作成します</p>
            </div>
            <div className="w-full max-w-3xl mx-auto px-4 pb-12">
                <RecipeCreateForm />
            </div>
        </div>
    );
}