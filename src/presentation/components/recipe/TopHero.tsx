import Link from "next/link";
import { Plus, BookOpen, Search, Calendar } from "lucide-react";

type Props = {
  recipeCount: number;
};

export function TopHero({ recipeCount }: Props) {
  return (
    <section className="relative overflow-hidden">
      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800" />
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.4'%3E%3Cpath d='M40 10c2 0 3.5 1.5 3.5 3.5S42 17 40 17s-3.5-1.5-3.5-3.5S38 10 40 10zm0 20c2 0 3.5 1.5 3.5 3.5S42 37 40 37s-3.5-1.5-3.5-3.5S38 30 40 30zm20-20c2 0 3.5 1.5 3.5 3.5S62 17 60 17s-3.5-1.5-3.5-3.5S58 10 60 10zm-40 0c2 0 3.5 1.5 3.5 3.5S22 17 20 17s-3.5-1.5-3.5-3.5S18 10 20 10z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative w-full max-w-5xl mx-auto px-4 pt-10 pb-12 sm:pt-14 sm:pb-16">
        {/* メインコピー */}
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-serif tracking-wide">
            家族の味を、ここに残そう
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            おばあちゃんの煮物、パパの特製カレー、週末のホットケーキ——
            <br className="hidden sm:block" />
            大切な家族のレシピを、みんなで守り、つないでいく場所です。
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto mb-10">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center border border-white/20">
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {recipeCount}
            </p>
            <p className="text-emerald-200 text-xs sm:text-sm mt-1">
              レシピ数
            </p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center border border-white/20">
            <p className="text-2xl sm:text-3xl font-bold text-white">—</p>
            <p className="text-emerald-200 text-xs sm:text-sm mt-1">
              家族メンバー
            </p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center border border-white/20">
            <p className="text-2xl sm:text-3xl font-bold text-white">—</p>
            <p className="text-emerald-200 text-xs sm:text-sm mt-1">
              今月の追加
            </p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/recipe/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 font-semibold rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            レシピを登録する
          </Link>
          <Link
            href="#recipe-list"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 text-white font-medium rounded-full border border-white/30 hover:bg-white/25 transition-all text-sm backdrop-blur-sm"
          >
            <BookOpen className="w-4 h-4" />
            レシピを見る
          </Link>
        </div>
      </div>
    </section>
  );
}

export function QuickAccessSection() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 -mt-6 relative z-10">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickAccessCard
          icon={<Search className="w-5 h-5 text-emerald-600" />}
          title="レシピ検索"
          description="食材やカテゴリからレシピを探せます"
          badge="実装予定"
        />
        <QuickAccessCard
          icon={<Calendar className="w-5 h-5 text-amber-600" />}
          title="献立カレンダー"
          description="今週の献立をまとめて計画できます"
          badge="実装予定"
        />
        <QuickAccessCard
          icon={<BookOpen className="w-5 h-5 text-rose-600" />}
          title="家族のストーリー"
          description="レシピにまつわる思い出を記録します"
          badge="実装予定"
        />
      </div>
    </section>
  );
}

function QuickAccessCard({
  icon,
  title,
  description,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100 cursor-default">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
            {badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  );
}
