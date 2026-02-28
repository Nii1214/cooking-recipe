import { RecipeCreateForm } from "@/presentation/components/recipe/RecipeCreateForm";

export default function Page() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto w-full max-w-4xl px-4 py-10 space-y-6">
                <header className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">レシピ登録</h1>
                    <p className="text-sm text-gray-600">家族で共有・継承できるレシピを作成します</p>
                </header>

                <RecipeCreateForm />
            </div>
        </div>
    );
}