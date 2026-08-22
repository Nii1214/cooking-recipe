import Link from "next/link";
import { ArrowRight, Check, Clock, Heart, ImageIcon, Search } from "lucide-react";
import { APP_NAME } from "@/constants/app";
import { GuestLoginButton } from "@/presentation/components/auth/guest-login-button";
import { Reveal } from "./Reveal";
import {
  LANDING_ACCOUNT_POINTS,
  LANDING_FAQS,
  LANDING_FEATURES,
  LANDING_RECIPE_FIELDS,
  LANDING_SEARCH_POINTS,
} from "./landing-content";

const MOCK_RECIPES = [
  { title: "肉じゃが", meta: "40分 · 4人前" },
  { title: "豚汁", meta: "30分 · 4人前" },
  { title: "だし巻き卵", meta: "15分 · 2人前" },
];

/**
 * レシピ一覧画面を模した装飾要素。実際の画面イメージを掴んでもらうために置く。
 *
 * @returns 検索・カテゴリ・一覧を含むモック
 */
function RecipeListMock() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-lg shadow-gray-900/10">
      <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 text-sm text-gray-500">
        <Search className="h-4 w-4" />
        レシピを検索
      </div>

      <div className="mt-4 flex gap-2">
        {["すべて", "和食", "お気に入り"].map((chip, i) => (
          <span
            key={chip}
            className={
              i === 0
                ? "rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white"
                : "rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600"
            }
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="mt-4 divide-y divide-gray-100">
        {MOCK_RECIPES.map((recipe, i) => (
          <div key={recipe.title} className="flex items-center gap-3 py-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <ImageIcon className="h-4 w-4 text-gray-400" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-gray-900">
                {recipe.title}
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {recipe.meta}
              </span>
            </span>
            <Heart
              className={
                i === 0
                  ? "h-4 w-4 fill-emerald-700 text-emerald-700"
                  : "h-4 w-4 text-gray-300"
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * サービス紹介のランディングページ。
 * Material Design のサーフェスと elevation を参考に、実装済みの機能を中心に伝える。
 *
 * @returns ランディングページ全体
 */
export function LandingPage() {
  return (
    <div className="bg-gray-100 pb-20">
      {/* Hero */}
      <section className="bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <span className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-900">
                家族向けレシピ管理
              </span>

              <h1 className="mt-6 text-4xl font-medium leading-[1.25] tracking-tight text-gray-900 sm:text-5xl">
                家族のレシピを、
                <br />
                まとめて管理する
              </h1>

              <p className="mt-5 max-w-md leading-relaxed text-gray-600">
                材料・手順・調理時間・写真をひとつの形式で登録し、検索とお気に入りで取り出せます。
                家族グループを作れば、登録したレシピをメンバー間で共有できます。
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-7 py-3.5 text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-md"
                >
                  無料で登録する
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <GuestLoginButton
                  formClassName="sm:w-auto"
                  buttonClassName="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 px-7 py-3.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
                />
              </div>
              <p className="mt-4 text-xs text-gray-500">
                登録は1分・無料 ·{" "}
                <Link href="/login" className="underline hover:text-gray-700">
                  ログイン
                </Link>
              </p>
            </div>

            <RecipeListMock />
          </div>
        </div>
      </section>

      {/* 機能一覧 */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <Reveal>
          <h2 className="text-2xl font-medium tracking-tight text-gray-900 sm:text-3xl">
            使える機能
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-gray-600">
            現在ご利用いただけるのは次の6つです。すべて無料で、追加のインストールは必要ありません。
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LANDING_FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delayMs={i * 60}>
              <div className="h-full rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-medium text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {feature.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 入力項目 / 探す / アカウント */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl bg-white p-7 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">
                レシピ登録で入力できる項目
              </h3>
              <ul className="mt-5 divide-y divide-gray-100">
                {LANDING_RECIPE_FIELDS.map((field) => (
                  <li
                    key={field}
                    className="flex items-start gap-3 py-3 text-sm text-gray-700"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <div className="grid gap-4">
            <Reveal>
              <div className="rounded-2xl bg-white p-7 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">探すための機能</h3>
                <ul className="mt-5 divide-y divide-gray-100">
                  {LANDING_SEARCH_POINTS.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 py-3 text-sm text-gray-700"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delayMs={80}>
              <div className="rounded-2xl bg-emerald-50 p-7">
                <h3 className="text-lg font-medium text-emerald-950">
                  アカウントとプロフィール
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {LANDING_ACCOUNT_POINTS.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-sm text-emerald-900"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <h2 className="text-2xl font-medium tracking-tight text-gray-900">
              よくある質問
            </h2>
          </Reveal>
          <div className="mt-6 divide-y divide-gray-200">
            {LANDING_FAQS.map((faq) => (
              <details key={faq.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-gray-900">
                  {faq.q}
                  <span className="text-gray-400 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pt-16">
        <Reveal>
          <div className="rounded-2xl bg-emerald-50 px-8 py-14 text-center">
            <h2 className="text-2xl font-medium tracking-tight text-emerald-950 sm:text-3xl">
              まずは1品、登録してみてください
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-emerald-900/80">
              入力は数分で終わります。{APP_NAME}に貯めたレシピは、検索とお気に入りからいつでも呼び出せます。
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-7 py-3.5 text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-md sm:w-auto"
              >
                無料で登録する
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <GuestLoginButton
                formClassName="w-full sm:w-auto"
                buttonClassName="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-700/30 px-7 py-3.5 text-sm font-medium text-emerald-900 transition-colors hover:bg-emerald-100 disabled:opacity-50 sm:w-auto"
              />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
