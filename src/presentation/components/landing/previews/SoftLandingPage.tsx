import Link from "next/link";
import { ArrowRight, Check, Heart, ImageIcon, Search, Smartphone } from "lucide-react";
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

/**
 * スマートフォンの画面に見立てたレシピ詳細のモック。
 *
 * @returns スマホ表示を模した装飾要素
 */
function PhoneMock() {
  return (
    <div className="mx-auto w-[264px] rounded-[2.5rem] border-8 border-white bg-white shadow-xl shadow-gray-900/10">
      <div className="overflow-hidden rounded-[1.9rem] bg-gray-50">
        <div className="relative flex h-32 items-center justify-center bg-gray-100">
          <ImageIcon className="h-7 w-7 text-gray-300" />
          <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white">
            <Heart className="h-4 w-4 fill-emerald-600 text-emerald-600" />
          </span>
        </div>

        <div className="bg-white px-4 py-4">
          <h3 className="text-sm font-bold text-gray-900">肉じゃが</h3>
          <div className="mt-2 flex gap-1.5">
            {["和食", "40分", "4人前"].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="mt-4 text-[11px] font-semibold text-gray-400">材料</p>
          <div className="mt-2 space-y-1.5">
            {[
              ["じゃがいも", "4個"],
              ["にんじん", "1本"],
              ["牛こま肉", "200g"],
            ].map(([name, amount]) => (
              <div
                key={name}
                className="flex justify-between rounded-lg bg-gray-50 px-2.5 py-1.5 text-[11px] text-gray-600"
              >
                <span>{name}</span>
                <span className="text-gray-400">{amount}</span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[11px] font-semibold text-gray-400">手順</p>
          <div className="mt-2 space-y-1.5">
            {["野菜を一口大に切る", "肉を炒めて野菜を加える"].map((step, i) => (
              <div
                key={step}
                className="flex gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5 text-[11px] text-gray-600"
              >
                <span className="font-semibold text-emerald-600">{i + 1}</span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ソフト（角丸と余白でやわらかく見せる）トーンのランディングページ案。
 * 配色はグレーの面 + emerald の 1 色に絞り、機能をスマホ操作のイメージで伝える。
 *
 * @returns ランディングページ全体
 */
export function SoftLandingPage() {
  return (
    <div className="bg-gray-50 pb-28">
      {/* Hero */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 pb-16 pt-20 text-center sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-600">
            <Smartphone className="h-3.5 w-3.5" />
            インストール不要・ブラウザだけで使えます
          </span>

          <h1 className="mt-7 text-[2.2rem] font-bold leading-[1.35] tracking-tight text-gray-900 sm:text-5xl">
            レシピの登録から共有まで、
            <br />
            スマホひとつで。
          </h1>

          <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-gray-600">
            材料・手順・調理時間・写真をまとめて登録。検索とお気に入りで呼び出して、キッチンでそのまま見られます。
          </p>

          <div className="mt-9 flex flex-col items-center gap-3">
            <Link
              href="/signup"
              className="group inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
            >
              無料で登録する
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <GuestLoginButton
              formClassName="w-full max-w-xs"
              buttonClassName="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-8 py-4 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            />
            <p className="text-xs text-gray-500">
              登録なしでも試せます ·{" "}
              <Link href="/login" className="underline hover:text-gray-700">
                ログイン
              </Link>
            </p>
          </div>

          <div className="mt-14">
            <PhoneMock />
          </div>
        </div>
      </section>

      {/* 機能一覧 */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <Reveal>
          <div className="text-center">
            <p className="text-sm font-bold text-emerald-600">機能一覧</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              いま使えるのは、この6つです
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LP_FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delayMs={i * 60}>
              <div className="h-full rounded-3xl bg-white p-7">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-bold text-gray-900">
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

      {/* 詳細 */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl bg-white p-8">
              <h3 className="text-lg font-bold text-gray-900">
                レシピ登録で入力できること
              </h3>
              <ul className="mt-5 space-y-3">
                {LP_RECIPE_FIELDS.map((field) => (
                  <li
                    key={field}
                    className="flex items-start gap-3 text-sm leading-relaxed text-gray-600"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <div className="grid gap-4">
            <Reveal>
              <div className="rounded-3xl bg-white p-8">
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Search className="h-5 w-5 text-emerald-600" />
                  探すための機能
                </h3>
                <ul className="mt-5 space-y-3">
                  {LP_SEARCH_POINTS.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-sm leading-relaxed text-gray-600"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delayMs={80}>
              <div className="rounded-3xl bg-white p-8">
                <h3 className="text-lg font-bold text-gray-900">
                  はじめるときの選択肢
                </h3>
                <ul className="mt-5 space-y-3">
                  {LP_ACCOUNT_POINTS.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-sm leading-relaxed text-gray-600"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
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
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <Reveal>
          <h2 className="text-center text-2xl font-bold text-gray-900">
            よくある質問
          </h2>
        </Reveal>
        <div className="mt-8 space-y-3">
          {LP_FAQS.map((faq) => (
            <details key={faq.q} className="group rounded-2xl bg-white p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-gray-900">
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
      <section className="mx-auto max-w-3xl px-6">
        <Reveal>
          <div className="rounded-[2rem] bg-emerald-600 px-8 py-14 text-center">
            <h2 className="text-2xl font-bold leading-relaxed text-white sm:text-3xl">
              まずは1品、
              <br className="hidden sm:block" />
              登録してみませんか？
            </h2>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-emerald-50">
              入力は数分。{APP_NAME}に貯めたレシピは、検索とお気に入りからいつでも呼び出せます。
            </p>
            <div className="mt-9 flex flex-col items-center gap-3">
              <Link
                href="/signup"
                className="group inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
              >
                無料で登録する
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <GuestLoginButton
                formClassName="w-full max-w-xs"
                buttonClassName="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/60 px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
              />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
