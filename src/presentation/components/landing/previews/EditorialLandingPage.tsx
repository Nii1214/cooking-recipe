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

/**
 * 誌面の見開きに見立てたレシピ詳細のモック。
 *
 * @returns レシピ 1 ページ分を模した装飾要素
 */
function RecipeSpread() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -bottom-3 -right-3 h-full w-full rounded-sm border border-stone-300 bg-[#f4f0e8]"
      />
      <article className="relative border border-stone-300 bg-[#fffdf8] p-8">
        <p className="text-[11px] tracking-[0.2em] text-stone-400">RECIPE No.014</p>
        <h3 className="mt-2 font-serif text-2xl text-stone-900">肉じゃが</h3>
        <p className="mt-1 text-xs text-stone-500">調理 40分 · 4人前 · 和食</p>

        <div className="mt-6 border-t border-stone-200 pt-5">
          <p className="font-serif text-xs tracking-widest text-stone-400">材料</p>
          <div className="mt-3 space-y-2 text-sm text-stone-700">
            {[
              ["じゃがいも", "4 個"],
              ["にんじん", "1 本"],
              ["牛こま肉", "200 g"],
              ["醤油", "大さじ2"],
            ].map(([name, amount]) => (
              <div key={name} className="flex items-baseline gap-2">
                <span>{name}</span>
                <span
                  aria-hidden
                  className="flex-1 border-b border-dotted border-stone-300"
                />
                <span className="text-stone-500">{amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-stone-200 pt-5">
          <p className="font-serif text-xs tracking-widest text-stone-400">手順</p>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed text-stone-700">
            {["野菜を一口大に切る", "肉を炒め、色が変わったら野菜を加える"].map(
              (step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="font-serif text-stone-400">{i + 1}</span>
                  {step}
                </li>
              ),
            )}
          </ol>
        </div>
      </article>
    </div>
  );
}

/**
 * エディトリアル（誌面）風のランディングページ案。
 * クリーム地・明朝体・罫線で、機能を目次形式に整理して見せる。
 *
 * @returns ランディングページ全体
 */
export function EditorialLandingPage() {
  return (
    <div className="bg-[#faf8f3] text-stone-800">
      {/* マストヘッド */}
      <div className="border-b border-stone-300">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3 text-[11px] tracking-[0.2em] text-stone-400">
          <span>{APP_NAME}</span>
          <span className="hidden sm:inline">家族向けレシピ管理</span>
          <span>機能ガイド</span>
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <p className="font-serif text-sm tracking-[0.3em] text-stone-400">
              RECIPE MANAGER
            </p>
            <h1 className="mt-5 font-serif text-[2.6rem] leading-[1.3] text-stone-900 sm:text-5xl">
              家の味を、
              <br />
              決まった形式で残す。
            </h1>
            <span aria-hidden className="mt-8 block h-px w-16 bg-stone-400" />
            <p className="mt-8 font-serif text-base leading-[2] text-stone-600">
              料理名、調理時間、人数、材料、手順、カテゴリ、写真。
              {APP_NAME}は、この形式でレシピを登録し、検索とお気に入りから取り出すための道具です。
              家族グループを作れば、登録したレシピをメンバー間で共有できます。
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-8 py-3.5 text-sm font-semibold tracking-wide text-[#faf8f3] transition-colors hover:bg-stone-800"
              >
                無料で登録する
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <GuestLoginButton
                formClassName="sm:w-auto"
                buttonClassName="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-stone-400 px-8 py-3.5 text-sm font-semibold tracking-wide text-stone-700 transition-colors hover:bg-stone-200/50 disabled:opacity-50 sm:w-auto"
              />
            </div>
            <p className="mt-4 text-xs text-stone-500">
              登録は1分・無料 ·{" "}
              <Link href="/login" className="underline hover:text-stone-700">
                ログインはこちら
              </Link>
            </p>
          </div>

          <RecipeSpread />
        </div>
      </section>

      {/* 機能一覧 */}
      <section className="border-y border-stone-300 bg-[#f4f0e8]">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <Reveal>
            <div className="flex items-baseline gap-4">
              <h2 className="font-serif text-sm tracking-[0.3em] text-stone-500">
                機能一覧
              </h2>
              <span aria-hidden className="h-px flex-1 bg-stone-300" />
            </div>
          </Reveal>

          <div className="mt-8 divide-y divide-stone-300 border-y border-stone-300">
            {LP_FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delayMs={i * 60}>
                <div className="grid gap-2 py-6 sm:grid-cols-[auto_180px_1fr] sm:items-baseline sm:gap-8">
                  <span className="font-serif text-xl text-stone-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif text-lg text-stone-900">
                    {feature.title}
                  </h3>
                  <p className="font-serif text-sm leading-[2] text-stone-600">
                    {feature.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 詳細 */}
      <section className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
        <Reveal>
          <div className="flex items-baseline gap-4">
            <h2 className="font-serif text-sm tracking-[0.3em] text-stone-500">
              詳細
            </h2>
            <span aria-hidden className="h-px flex-1 bg-stone-300" />
          </div>
        </Reveal>

        <div className="mt-10 grid gap-px border border-stone-300 bg-stone-300 sm:grid-cols-3">
          {[
            { title: "登録できる項目", items: LP_RECIPE_FIELDS },
            { title: "探すための機能", items: LP_SEARCH_POINTS },
            { title: "アカウント", items: LP_ACCOUNT_POINTS },
          ].map((group) => (
            <div key={group.title} className="bg-[#faf8f3] p-7">
              <h3 className="font-serif text-lg text-stone-900">{group.title}</h3>
              <ul className="mt-5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="border-t border-stone-200 py-3 font-serif text-sm leading-relaxed text-stone-600"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-stone-300 bg-[#f4f0e8]">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <Reveal>
            <div className="flex items-baseline gap-4">
              <h2 className="font-serif text-sm tracking-[0.3em] text-stone-500">
                よくある質問
              </h2>
              <span aria-hidden className="h-px flex-1 bg-stone-300" />
            </div>
          </Reveal>
          <div className="mt-8 border-t border-stone-300">
            {LP_FAQS.map((faq) => (
              <details key={faq.q} className="group border-b border-stone-300 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-sm text-stone-900">
                  {faq.q}
                  <span className="text-stone-400 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 font-serif text-sm leading-[2] text-stone-600">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
        <Reveal>
          <h2 className="font-serif text-3xl leading-snug text-stone-900 sm:text-4xl">
            レシピを1品、
            <br className="hidden sm:block" />
            登録するところから。
          </h2>
          <p className="mx-auto mt-6 max-w-md font-serif text-sm leading-[2] text-stone-600">
            入力は数分で終わります。書きかけのまま下書きに残して、あとから続けることもできます。
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-8 py-3.5 text-sm font-semibold tracking-wide text-[#faf8f3] transition-colors hover:bg-stone-800 sm:w-auto"
            >
              無料で登録する
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <GuestLoginButton
              formClassName="w-full sm:w-auto"
              buttonClassName="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-stone-400 px-8 py-3.5 text-sm font-semibold tracking-wide text-stone-700 transition-colors hover:bg-stone-200/50 disabled:opacity-50 sm:w-auto"
            />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
