import { Clock, Users } from "lucide-react";

type DummyRecipe = {
  title: string;
  description: string;
  emoji: string;
  minutes: number;
  servings: number;
  categories: string[];
};

/** ヒーローの下に置く見本レシピ。実データは使わず、見た目の比較だけに使う */
const DUMMY_RECIPES: DummyRecipe[] = [
  {
    title: "母の肉じゃが",
    description: "煮汁が少なくなるまでじっくり。冷めてからが美味しい。",
    emoji: "🍲",
    minutes: 40,
    servings: 4,
    categories: ["和食", "煮物"],
  },
  {
    title: "週末のホットケーキ",
    description: "牛乳を少し多めにしてふんわり焼き上げる。",
    emoji: "🍳",
    minutes: 20,
    servings: 3,
    categories: ["おやつ"],
  },
  {
    title: "パパの特製カレー",
    description: "隠し味のインスタントコーヒーが効いている。",
    emoji: "🍛",
    minutes: 60,
    servings: 5,
    categories: ["洋食", "煮込み"],
  },
  {
    title: "冬野菜のポトフ",
    description: "冬に作り置きしておくと重宝する野菜たっぷりスープ。",
    emoji: "🥘",
    minutes: 50,
    servings: 4,
    categories: ["スープ"],
  },
  {
    title: "冷やし中華はじめました",
    description: "タレは酢と醤油を 1:1、砂糖はひかえめに。",
    emoji: "🍜",
    minutes: 25,
    servings: 2,
    categories: ["麺"],
  },
  {
    title: "祖母のちらし寿司",
    description: "お祝いの日の定番。錦糸卵は薄く焼くのがコツ。",
    emoji: "🍙",
    minutes: 70,
    servings: 6,
    categories: ["和食", "行事食"],
  },
];

/**
 * ヒーロー案の下に表示する見本のレシピ一覧。
 * ヒーローの高さによって一覧がどこから見え始めるかを比較するために置く。
 *
 * @returns 見本レシピのグリッド
 */
export function PreviewRecipeList() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 pt-10 pb-16">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-xl font-bold text-gray-900 font-serif">
          みんなのレシピ
        </h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        家族が登録した公開済みのレシピ一覧です
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {DUMMY_RECIPES.map((recipe) => (
          <div
            key={recipe.title}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col"
          >
            <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center">
              <span className="text-5xl opacity-60">{recipe.emoji}</span>
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 bg-black/60 text-white text-xs font-medium rounded-full">
                <Clock className="w-3 h-3" />
                {recipe.minutes}分
              </span>
            </div>

            <div className="flex-1 p-4 space-y-2.5">
              <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug">
                {recipe.title}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                {recipe.description}
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <Users className="w-3.5 h-3.5" />
                  {recipe.servings}人前
                </span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {recipe.categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0 text-[10px] text-gray-600"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
