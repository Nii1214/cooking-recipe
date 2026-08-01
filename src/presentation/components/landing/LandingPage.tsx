import Link from "next/link";
import {
  ArrowRight,
  BookHeart,
  ChefHat,
  Lock,
  NotebookPen,
  Sparkles,
  Users,
} from "lucide-react";
import { APP_NAME } from "@/constants/app";
import { GuestLoginButton } from "@/presentation/components/auth/guest-login-button";
import { Reveal } from "./Reveal";
import { ScrollProgress } from "./ScrollProgress";

const MARQUEE_DISHES = [
  "肉じゃが",
  "ぶり大根",
  "だし巻き卵",
  "ホットケーキ",
  "餃子",
  "豚汁",
  "から揚げ",
  "ちらし寿司",
  "おはぎ",
  "カレー",
];

function HeroNote({
  label,
  title,
  lines,
  memo,
  className,
  rotation,
  floatDelay,
}: {
  label: string;
  title: string;
  lines: string[];
  memo: string;
  className?: string;
  rotation: string;
  floatDelay: string;
}) {
  return (
    <article
      className={`lp-float rounded-2xl border border-stone-200 bg-[#fffdf8] p-5 shadow-xl shadow-stone-900/5 ${className ?? ""}`}
      style={
        {
          "--lp-rot": rotation,
          transform: `rotate(${rotation})`,
          animationDelay: floatDelay,
        } as React.CSSProperties
      }
    >
      <p className="text-[11px] tracking-wide text-stone-400">{label}</p>
      <h3 className="mt-1 font-serif text-lg text-stone-800">{title}</h3>
      <div className="mt-3 space-y-1 border-t border-dashed border-stone-200 pt-3 font-mono text-[13px] text-stone-600">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-stone-500">{memo}</p>
    </article>
  );
}

function Polaroid({
  emoji,
  caption,
  className,
  rotation,
  floatDelay,
}: {
  emoji: string;
  caption: string;
  className?: string;
  rotation: string;
  floatDelay: string;
}) {
  return (
    <div
      className={`lp-float rounded-xl bg-white p-2.5 shadow-2xl shadow-stone-900/15 ${className ?? ""}`}
      style={
        {
          "--lp-rot": rotation,
          transform: `rotate(${rotation})`,
          animationDelay: floatDelay,
        } as React.CSSProperties
      }
    >
      <span
        aria-hidden
        className="absolute -top-2 left-1/2 h-4 w-16 -translate-x-1/2 -rotate-2 rounded-sm bg-amber-200/70"
      />
      <div className="flex h-28 w-28 items-center justify-center rounded-md bg-gradient-to-br from-emerald-50 via-amber-50 to-orange-50 text-5xl">
        {emoji}
      </div>
      <p className="mt-2 text-center font-serif text-xs text-stone-500">
        {caption}
      </p>
    </div>
  );
}

function Chip({
  children,
  className,
  rotation,
  floatDelay,
}: {
  children: React.ReactNode;
  className?: string;
  rotation: string;
  floatDelay: string;
}) {
  return (
    <span
      className={`lp-float absolute rounded-full border border-stone-200 bg-white/90 px-3 py-1 text-xs font-medium text-stone-600 shadow-md backdrop-blur-sm ${className ?? ""}`}
      style={
        {
          "--lp-rot": rotation,
          transform: `rotate(${rotation})`,
          animationDelay: floatDelay,
        } as React.CSSProperties
      }
    >
      {children}
    </span>
  );
}

function MomentCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <figure className="group relative h-full rounded-2xl border border-stone-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <span className="absolute left-6 top-6 font-serif text-4xl leading-none text-emerald-200 transition-colors duration-300 group-hover:text-emerald-300">
        “
      </span>
      <blockquote className="relative pt-8 font-serif text-lg leading-snug text-gray-900">
        {title}
      </blockquote>
      <figcaption className="mt-3 text-sm leading-relaxed text-gray-500">
        {body}
      </figcaption>
    </figure>
  );
}

function StepCard({
  step,
  icon,
  title,
  body,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
          {icon}
        </div>
        <span className="font-serif text-sm tracking-widest text-emerald-700">
          STEP {step}
        </span>
      </div>
      <h3 className="mt-5 font-serif text-xl text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{body}</p>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="overflow-hidden bg-stone-50">
      <ScrollProgress />

      {/* Hero */}
      <section className="relative border-b border-stone-200/80">
        <div
          aria-hidden
          className="lp-blob absolute -left-24 -top-24 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl"
        />
        <div
          aria-hidden
          className="lp-blob absolute -right-20 top-24 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl"
          style={{ animationDelay: "-6s" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.4] [background-image:radial-gradient(circle_at_center,#0000000a_1px,transparent_1px)] [background-size:22px_22px]"
        />

        <div className="relative mx-auto grid max-w-5xl gap-12 px-6 py-20 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
          <div>
            <div
              className="lp-animate-in inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-medium text-emerald-800 backdrop-blur-sm"
              style={{ animationDelay: "0ms" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {APP_NAME}
            </div>

            <h1
              className="lp-animate-in mt-6 font-serif text-[2.6rem] leading-[1.15] tracking-tight text-gray-900 sm:text-6xl"
              style={{ animationDelay: "80ms" }}
            >
              家族の味を、
              <br />
              <span className="relative inline-block">
                <span className="lp-gradient-text bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                  ここに残そう
                </span>
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-3 w-full -rotate-1 rounded-full bg-amber-200/70"
                />
              </span>
            </h1>

            <p
              className="lp-animate-in mt-6 max-w-md text-base leading-relaxed text-gray-600 sm:text-lg"
              style={{ animationDelay: "160ms" }}
            >
              紙のメモ、写真のスクショ、誰かのひと言——あちこちに散らばったレシピを、家族みんなで使える形にまとめます。
            </p>

            <div
              className="lp-animate-in mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                href="/signup"
                className="lp-shimmer group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-emerald-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/30"
              >
                無料ではじめる
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-white px-7 py-3.5 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-50"
              >
                ログイン
              </Link>
              <GuestLoginButton
                formClassName="w-full sm:w-auto"
                buttonClassName="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 px-7 py-3.5 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 disabled:opacity-50 sm:w-auto"
              />
            </div>
            <p
              className="lp-animate-in mt-3 text-xs leading-relaxed text-gray-500"
              style={{ animationDelay: "280ms" }}
            >
              ゲストで試す場合、アカウント登録なしですぐ体験できます（データは一定期間後に削除されます）
            </p>

            <div
              className="lp-animate-in mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500"
              style={{ animationDelay: "320ms" }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-600" />
                家族だけの公開範囲
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookHeart className="h-3.5 w-3.5 text-emerald-600" />
                思い出メモも一緒に
              </span>
            </div>
          </div>

          <div
            className="lp-animate-in relative mx-auto h-[400px] w-full max-w-sm sm:h-[440px]"
            style={{ animationDelay: "200ms" }}
          >
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-emerald-200"
            />
            <HeroNote
              className="absolute left-0 top-2 w-60"
              label="母のメモ"
              title="根菜の煮物"
              lines={["じゃがいも", "にんじん", "だし · 醤油 · みりん"]}
              memo="塩は最後に少しずつ。煮崩れても気にしない"
              rotation="-5deg"
              floatDelay="0s"
            />
            <Polaroid
              className="absolute right-2 top-0"
              emoji="🍲"
              caption="日曜の食卓"
              rotation="5deg"
              floatDelay="-2s"
            />
            <HeroNote
              className="absolute bottom-0 right-4 w-56"
              label="週末のおやつ"
              title="ホットケーキ"
              lines={["薄力粉 200g", "牛乳 · 卵", "はちみつ 少し"]}
              memo="焼く前に少し休ませると ふわっとする"
              rotation="6deg"
              floatDelay="-3.5s"
            />
            <Chip
              className="bottom-24 left-0"
              rotation="-4deg"
              floatDelay="-1s"
            >
              にんじん
            </Chip>
            <Chip
              className="left-20 top-0"
              rotation="3deg"
              floatDelay="-2.6s"
            >
              ひと言メモ
            </Chip>
          </div>
        </div>

        {/* 流れるディッシュ */}
        <div className="relative border-t border-stone-200/80 bg-white/60 py-4 backdrop-blur-sm">
          <div className="flex w-max lp-marquee">
            {[...MARQUEE_DISHES, ...MARQUEE_DISHES].map((dish, i) => (
              <span
                key={`${dish}-${i}`}
                className="mx-5 inline-flex items-center gap-2 font-serif text-sm text-stone-400"
              >
                {dish}
                <span className="text-emerald-300">·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ふと思い出す、あの味 */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-wide text-emerald-700">
                なぜ残すのか
              </p>
              <h2 className="mt-2 font-serif text-3xl text-gray-900 sm:text-4xl">
                ふと思い出す、あの味
              </h2>
              <p className="mt-4 leading-relaxed text-gray-600">
                レシピは作り方の記録であると同時に、誰かとの思い出でもあります。
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                title: "「あの料理、どう作るんだっけ」",
                body: "聞くたびに少しずつ違う。いつか、誰も覚えていないかもしれない。",
              },
              {
                title: "写真だけ送られてきたレシピ",
                body: "材料はわかっても、火加減やひと足しの分量が書いていない。再現できないもどかしさがある。",
              },
              {
                title: "離れて暮らす家族の食卓",
                body: "同じレシピを作れたら、距離が少し縮まる。味は会えない時間をつなぐ手がかりになる。",
              },
            ].map((m, i) => (
              <Reveal key={m.title} delayMs={i * 120}>
                <MomentCard title={m.title} body={m.body} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* レシピを、こう残していく */}
      <section className="border-y border-stone-200/80 bg-stone-50 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <p className="text-sm font-medium tracking-wide text-emerald-700">
              できること
            </p>
            <h2 className="mt-2 font-serif text-3xl text-gray-900 sm:text-4xl">
              レシピを、こう残していく
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-gray-600">
              材料と手順を整理するだけでなく、家族で共有し、大切な人の分だけを預けられる場所です。
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Reveal className="sm:col-span-2 lg:row-span-2">
              <div className="group relative h-full overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white shadow-lg shadow-emerald-900/10">
                <div
                  aria-hidden
                  className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-125"
                />
                <div className="relative flex h-full flex-col justify-between gap-8">
                  <div>
                    <div className="inline-flex rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
                      <ChefHat className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 font-serif text-2xl">
                      作り方を、そのまま残す
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-emerald-50/90">
                      材料と手順に加えて、「弱火でじっくり」「味見してから塩」といったひと言メモも一緒に。写真を添えれば、あの頃の食卓の様子まで思い出せます。
                    </p>
                  </div>
                  <ul className="space-y-2.5 text-sm text-emerald-50">
                    {[
                      "材料・手順・調理時間を整理",
                      "カテゴリやお気に入りで探しやすく",
                      "写真付きで一覧も見やすく",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-2.5">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-amber-300" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>

            <Reveal delayMs={120}>
              <div className="group h-full rounded-3xl border border-stone-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="inline-flex rounded-xl bg-emerald-50 p-2.5 text-emerald-700 transition-colors group-hover:bg-emerald-100">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-serif text-lg text-gray-900">
                  家族で共有
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  招待した家族だけが見られる場所です。離れて暮らしていても、同じレシピ帳をめくれます。
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={200}>
              <div className="group h-full rounded-3xl border border-stone-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="inline-flex rounded-xl bg-emerald-50 p-2.5 text-emerald-700 transition-colors group-hover:bg-emerald-100">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-serif text-lg text-gray-900">
                  外には見せない
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  家族の食の記録は家族のもの。公開レシピサイトとは違い、大切な人の分だけを預けられます。
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 引用 */}
      <section className="bg-white py-24 sm:py-32">
        <Reveal>
          <figure className="mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
            <span aria-hidden className="h-px w-10 bg-emerald-300" />
            <blockquote className="my-8 font-serif text-2xl leading-[1.7] text-gray-900 sm:text-[1.9rem]">
              この味、ちゃんと残しておけばよかった。
              <br className="hidden sm:block" />
              そう思う前に、はじめよう。
            </blockquote>
            <span aria-hidden className="h-px w-10 bg-emerald-300" />
          </figure>
        </Reveal>
      </section>

      {/* はじめかた */}
      <section className="border-y border-stone-200/80 bg-stone-50 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <p className="text-sm font-medium tracking-wide text-emerald-700">
              はじめかた
            </p>
            <h2 className="mt-2 font-serif text-3xl text-gray-900 sm:text-4xl">
              3 ステップで、味帳ができる
            </h2>
          </Reveal>

          <div className="relative mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
            <div
              aria-hidden
              className="absolute left-0 right-0 top-6 hidden border-t border-dashed border-stone-300 sm:block"
            />
            {[
              {
                step: "01",
                icon: <NotebookPen className="h-5 w-5" />,
                title: "書きとめる",
                body: "今あるメモや写真を見ながら、材料と手順を入力。ひと言メモも添えられます。",
              },
              {
                step: "02",
                icon: <Users className="h-5 w-5" />,
                title: "家族を招く",
                body: "家族を招待すれば、同じレシピ帳を一緒に育てられます。",
              },
              {
                step: "03",
                icon: <ChefHat className="h-5 w-5" />,
                title: "いつでも作る",
                body: "食べたくなったら開くだけ。家族みんなで、味をつないでいけます。",
              },
            ].map((s, i) => (
              <Reveal key={s.step} delayMs={i * 120} className="relative">
                <StepCard {...s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-50 px-6 pb-24 pt-20">
        <Reveal>
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-700 via-emerald-700 to-teal-800 px-8 py-16 text-center shadow-xl shadow-emerald-900/15 sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="lp-blob absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl"
            />
            <div
              aria-hidden
              className="lp-blob absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl"
              style={{ animationDelay: "-5s" }}
            />
            <div
              aria-hidden
              className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,#ffffff22_1px,transparent_1px)] [background-size:20px_20px]"
            />
            <p className="relative font-serif text-2xl leading-relaxed text-white sm:text-3xl">
              今日の夕飯のメモから、
              <br className="hidden sm:block" />
              あとで誰かが作れる記録へ。
            </p>
            <p className="relative mx-auto mt-4 max-w-md text-sm leading-relaxed text-emerald-50/90">
              完璧なレシピでなくていい。今あるメモを、そのまま残すところから始められます。
            </p>
            <div className="relative mt-9 flex flex-col items-center gap-4">
              <Link
                href="/signup"
                className="lp-shimmer group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-white px-9 py-3.5 text-sm font-semibold text-emerald-800 shadow-lg transition-all hover:bg-emerald-50"
              >
                {APP_NAME}をはじめる
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <GuestLoginButton
                formClassName="w-full max-w-xs"
                buttonClassName="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 px-9 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-50"
              />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
