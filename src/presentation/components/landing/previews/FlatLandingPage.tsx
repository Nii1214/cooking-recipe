import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

const SPEC_ROWS = [
  ["登録できるレシピ数", "無制限"],
  ["サムネイル写真", "1レシピにつき1枚 / 5MBまで"],
  ["対応形式", "JPEG · PNG · WebP · GIF"],
  ["検索対象", "料理名 · レシピコメント"],
  ["公開範囲", "同じ家族グループのメンバーのみ"],
  ["利用料金", "無料"],
];

/**
 * フラットデザインのランディングページ案。
 * 影・グラデーションを使わず、罫線と塗りのコントラストだけで構成する。
 *
 * @returns ランディングページ全体
 */
export function FlatLandingPage() {
  return (
    <div className="bg-white text-gray-900">
      {/* Hero */}
      <section className="border-b-2 border-gray-900">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <p className="text-xs font-bold tracking-[0.2em] text-emerald-600">
            FAMILY RECIPE MANAGER
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.2] tracking-tight sm:text-6xl">
            レシピ管理を、
            <br />
            シンプルに。
          </h1>
          <p className="mt-6 max-w-xl leading-relaxed text-gray-600">
            材料・手順・調理時間・写真を決まった形式で登録し、キーワードとカテゴリで取り出す。
            {APP_NAME}は、家族のレシピを扱うためだけのシンプルな管理ツールです。
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
            >
              無料で登録する
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <GuestLoginButton
              formClassName="sm:w-auto"
              buttonClassName="inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-gray-900 px-8 py-4 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-900 hover:text-white disabled:opacity-50 sm:w-auto"
            />
          </div>
          <p className="mt-4 text-xs text-gray-500">
            クレジットカード不要 ·{" "}
            <Link href="/login" className="underline hover:text-gray-900">
              ログインはこちら
            </Link>
          </p>
        </div>
      </section>

      {/* 機能一覧 */}
      <section className="border-b-2 border-gray-900">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">機能一覧</h2>
          </Reveal>
        </div>
        <div className="grid gap-px border-y border-gray-900 bg-gray-900 sm:grid-cols-2 lg:grid-cols-3">
          {LP_FEATURES.map((feature, i) => (
            <div key={feature.title} className="bg-white p-8">
              <div className="flex items-center justify-between">
                <feature.icon className="h-6 w-6 text-emerald-600" />
                <span className="text-xs font-bold tracking-widest text-gray-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 入力項目 */}
      <section className="border-b-2 border-gray-900">
        <div className="mx-auto grid max-w-5xl gap-0 sm:grid-cols-2">
          <div className="border-b border-gray-900 p-8 sm:border-b-0 sm:border-r sm:p-12">
            <h2 className="text-xl font-bold">登録できる項目</h2>
            <ul className="mt-6 space-y-0">
              {LP_RECIPE_FIELDS.map((field) => (
                <li
                  key={field}
                  className="border-b border-gray-200 py-3 text-sm text-gray-700"
                >
                  {field}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-emerald-600 p-8 text-white sm:p-12">
            <h2 className="text-xl font-bold">探すための機能</h2>
            <ul className="mt-6">
              {LP_SEARCH_POINTS.map((point) => (
                <li
                  key={point}
                  className="border-b border-white/25 py-3 text-sm text-emerald-50"
                >
                  {point}
                </li>
              ))}
            </ul>
            <h2 className="mt-10 text-xl font-bold">アカウント</h2>
            <ul className="mt-6">
              {LP_ACCOUNT_POINTS.map((point) => (
                <li
                  key={point}
                  className="border-b border-white/25 py-3 text-sm text-emerald-50"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 仕様 */}
      <section className="border-b-2 border-gray-900">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight">仕様</h2>
          </Reveal>
          <dl className="mt-8 border-t border-gray-900">
            {SPEC_ROWS.map(([label, value]) => (
              <div
                key={label}
                className="grid gap-1 border-b border-gray-200 py-4 sm:grid-cols-[220px_1fr] sm:gap-6"
              >
                <dt className="text-sm font-bold text-gray-900">{label}</dt>
                <dd className="text-sm text-gray-600">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b-2 border-gray-900">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight">よくある質問</h2>
          </Reveal>
          <div className="mt-8 border-t border-gray-900">
            {LP_FAQS.map((faq) => (
              <details key={faq.q} className="group border-b border-gray-200 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold">
                  {faq.q}
                  <span className="text-emerald-600 transition-transform group-open:rotate-45">
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
      <section className="bg-gray-900 px-6 py-20 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          レシピを1品、登録するところから
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-gray-400">
          入力は数分で終わります。登録したレシピは検索・お気に入り・家族グループからすぐ呼び出せます。
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="group inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-md bg-emerald-600 px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-emerald-500 sm:w-auto"
          >
            無料で登録する
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <GuestLoginButton
            formClassName="w-full max-w-xs sm:w-auto"
            buttonClassName="inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-white px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-white hover:text-gray-900 disabled:opacity-50 sm:w-auto"
          />
        </div>
      </section>
    </div>
  );
}
