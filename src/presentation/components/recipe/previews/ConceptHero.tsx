import { Fragment } from "react";
import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";

type Props = {
  recipeCount: number;
  headline: string;
  bodyLines: string[];
};

/**
 * 現行 TopHero と同じデザインのまま、見出しと本文だけを差し替えられるヒーロー。
 * コピー案の比較にのみ使う。
 *
 * @param recipeCount 登録レシピ件数
 * @param headline 見出し
 * @param bodyLines 見出し下の本文。空配列なら本文を表示しない。2 要素以上の場合は sm 以上で改行する
 * @returns コピーを差し替えたヒーロー
 */
export function ConceptHero({ recipeCount, headline, bodyLines }: Props) {
  return (
    <section className="relative overflow-hidden">
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
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-serif tracking-wide">
            {headline}
          </h1>
          {bodyLines.length > 0 && (
            <p className="text-emerald-100 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              {bodyLines.map((line, index) => (
                <Fragment key={line}>
                  {index > 0 && <br className="hidden sm:block" />}
                  {line}
                </Fragment>
              ))}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto mb-10">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center border border-white/20">
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {recipeCount}
            </p>
            <p className="text-emerald-200 text-xs sm:text-sm mt-1">レシピ数</p>
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
