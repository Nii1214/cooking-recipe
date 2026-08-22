import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  Heart,
  ImageIcon,
  NotebookPen,
  Search,
} from "lucide-react";
import { APP_NAME } from "@/constants/app";
import { GuestLoginButton } from "@/presentation/components/auth/guest-login-button";
import { Reveal } from "../Reveal";
import {
  LANDING_ACCOUNT_POINTS as LP_ACCOUNT_POINTS,
  LANDING_FAQS as LP_FAQS,
  LANDING_FEATURES as LP_FEATURES,
  LANDING_RECIPE_FIELDS as LP_RECIPE_FIELDS,
  LANDING_SEARCH_POINTS as LP_SEARCH_POINTS,
} from "../landing-content";

const RECIPE_MOCKS = [
  { title: "肉じゃが", meta: "40分 · 4人前" },
  { title: "豚汁", meta: "30分 · 4人前" },
  { title: "だし巻き卵", meta: "15分 · 2人前" },
];

/**
 * ブラウザ枠に見立てたアプリ画面のモック。
 *
 * @returns レシピ一覧画面を模した装飾要素
 */
function AppMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-900/5">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
        <div className="ml-3 flex-1 rounded-md bg-white px-3 py-1 text-left text-[11px] text-gray-400">
          {APP_NAME} / レシピ一覧
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-xs text-gray-400 sm:w-64">
            <Search className="h-3.5 w-3.5" />
            レシピを検索
          </div>
          <div className="hidden items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white sm:flex">
            <NotebookPen className="h-3.5 w-3.5" />
            レシピを追加
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-4">
          {RECIPE_MOCKS.map((recipe, i) => (
            <div
              key={recipe.title}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white text-left"
            >
              <div className="relative flex aspect-[4/3] items-center justify-center bg-gray-100">
                <ImageIcon className="h-5 w-5 text-gray-300" />
                {i === 0 && (
                  <Heart className="absolute right-2 top-2 h-3.5 w-3.5 fill-emerald-600 text-emerald-600" />
                )}
              </div>
              <div className="p-2.5">
                <p className="truncate text-[11px] font-semibold text-gray-800 sm:text-xs">
                  {recipe.title}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                  <Clock className="h-2.5 w-2.5" />
                  {recipe.meta}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 機能紹介用のカード。
 *
 * @param icon 見出し上に置くアイコン
 * @param title 機能名
 * @param body 機能の説明文
 * @returns 機能カード要素
 */
function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 transition-colors hover:border-gray-300">
      <div className="inline-flex rounded-lg bg-gray-100 p-2.5 text-gray-700">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{body}</p>
    </div>
  );
}

/**
 * テキストとモック画面を左右に並べる詳細セクション。
 *
 * @param eyebrow 見出しの上に置く小見出し
 * @param title セクション見出し
 * @param body 説明文
 * @param points 箇条書きにする要点
 * @param mock 反対側に置くモック要素
 * @param reversed true のときテキストとモックの配置を左右入れ替える
 * @returns 詳細セクション要素
 */
function DetailSection({
  eyebrow,
  title,
  body,
  points,
  mock,
  reversed = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  mock: React.ReactNode;
  reversed?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={reversed ? "lg:order-2" : undefined}>
        <p className="text-xs font-semibold tracking-wider text-emerald-700">
          {eyebrow}
        </p>
        <h3 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {title}
        </h3>
        <p className="mt-4 leading-relaxed text-gray-600">{body}</p>
        <ul className="mt-6 space-y-3">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-gray-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div className={reversed ? "lg:order-1" : undefined}>{mock}</div>
    </div>
  );
}

/**
 * SaaS 風のランディングページ案。
 * 白基調・細い罫線・アプリ画面のモックで、使える機能を端的に伝える。
 *
 * @returns ランディングページ全体
 */
export function SaasLandingPage() {
  return (
    <div className="bg-white pb-24">
      {/* Hero */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-6 pb-16 pt-20 text-center sm:pt-24">
          <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
            家族向けレシピ管理ツール
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.2] tracking-tight text-gray-900 sm:text-6xl">
            家族のレシピを、
            <br />
            1か所で管理する。
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
            材料・手順・調理時間・写真を決まった形式で登録。検索とお気に入りから、作りたいレシピにすぐ辿り着けます。
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 sm:w-auto"
            >
              無料で登録する
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <GuestLoginButton
              formClassName="w-full sm:w-auto"
              buttonClassName="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-7 py-3.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
            />
          </div>

          <p className="mt-4 text-xs text-gray-500">
            クレジットカード不要 · 登録は1分 ·{" "}
            <Link href="/login" className="underline hover:text-gray-700">
              すでにアカウントをお持ちの方
            </Link>
          </p>

          <div className="mt-16">
            <AppMock />
          </div>
        </div>
      </section>

      {/* 機能一覧 */}
      <section className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wider text-emerald-700">
              機能一覧
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              いま使える6つの機能
            </h2>
            <p className="mt-4 leading-relaxed text-gray-600">
              レシピを残す・探す・共有するために必要なところだけを揃えています。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LP_FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delayMs={i * 60}>
              <FeatureCard
                icon={<feature.icon className="h-5 w-5" />}
                title={feature.title}
                body={feature.body}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* 詳細 */}
      <section className="border-y border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-5xl space-y-20 px-6 py-20 sm:space-y-24 sm:py-24">
          <Reveal>
            <DetailSection
              eyebrow="登録する"
              title="決まった形式で、迷わず入力"
              body="項目が決まっているので、誰が登録しても同じ粒度で残ります。書きかけは下書きとして保存できます。"
              points={LP_RECIPE_FIELDS}
              mock={
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <p className="text-xs font-semibold text-gray-400">材料（4人前）</p>
                  <div className="mt-3 space-y-2">
                    {[
                      ["じゃがいも", "4", "個"],
                      ["にんじん", "1", "本"],
                      ["牛こま肉", "200", "g"],
                      ["醤油", "大さじ2", ""],
                    ].map(([name, value, unit]) => (
                      <div key={name} className="flex items-center gap-2">
                        <span className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700">
                          {name}
                        </span>
                        <span className="w-16 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-500">
                          {value}
                        </span>
                        <span className="w-12 rounded-md border border-gray-200 px-2 py-2 text-center text-sm text-gray-500">
                          {unit || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 text-xs font-semibold text-gray-400">手順</p>
                  <div className="mt-3 space-y-2">
                    {["野菜を一口大に切る", "肉を炒めて色が変わったら野菜を加える"].map(
                      (step, i) => (
                        <div
                          key={step}
                          className="flex gap-3 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700"
                        >
                          <span className="font-semibold text-gray-400">{i + 1}</span>
                          {step}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              }
            />
          </Reveal>

          <Reveal>
            <DetailSection
              reversed
              eyebrow="探す"
              title="増えても、目的のレシピに届く"
              body="キーワード・カテゴリ・お気に入りの3つで絞り込めます。検索対象は料理名とレシピコメントです。"
              points={LP_SEARCH_POINTS}
              mock={
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-600">
                    <Search className="h-4 w-4 text-gray-400" />
                    肉じゃが
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["すべて", "和食", "洋食", "汁物"].map((tag, i) => (
                      <span
                        key={tag}
                        className={
                          i === 1
                            ? "rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white"
                            : "rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600"
                        }
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 space-y-3">
                    {["肉じゃが", "肉じゃがコロッケ", "新じゃがの煮物"].map(
                      (title, i) => (
                        <div
                          key={title}
                          className="flex items-center gap-3 rounded-lg border border-gray-200 p-2.5"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-100">
                            <ImageIcon className="h-4 w-4 text-gray-300" />
                          </span>
                          <span className="flex-1 text-sm text-gray-800">{title}</span>
                          <Heart
                            className={
                              i === 0
                                ? "h-4 w-4 fill-emerald-600 text-emerald-600"
                                : "h-4 w-4 text-gray-300"
                            }
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              }
            />
          </Reveal>
        </div>
      </section>

      {/* アカウント */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <Reveal>
          <div className="rounded-2xl border border-gray-200 p-8 sm:p-10">
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              はじめ方は2通り
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {LP_ACCOUNT_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-700"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            よくある質問
          </h2>
        </Reveal>
        <div className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
          {LP_FAQS.map((faq) => (
            <details key={faq.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-gray-900">
                {faq.q}
                <span className="text-gray-400 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6">
        <Reveal>
          <div className="rounded-2xl bg-gray-900 px-8 py-14 text-center sm:px-12">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              まずは1品、登録してみてください
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-gray-400">
              入力は数分で終わります。登録したレシピは検索とお気に入りからいつでも呼び出せます。
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 sm:w-auto"
              >
                無料で登録する
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <GuestLoginButton
                formClassName="w-full sm:w-auto"
                buttonClassName="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-700 px-7 py-3.5 text-sm font-semibold text-gray-200 transition-colors hover:bg-gray-800 disabled:opacity-50 sm:w-auto"
              />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
