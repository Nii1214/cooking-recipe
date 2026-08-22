export type LpPreviewTheme = {
  slug: string;
  name: string;
  concept: string;
  description: string;
  /** 一覧のスウォッチ表示に使う Tailwind クラス */
  swatchClassName: string;
};

/** LP デザイン検証用テーマの一覧。/lp 配下のルートと 1:1 で対応する */
export const LP_PREVIEW_THEMES: LpPreviewTheme[] = [
  {
    slug: "flat",
    name: "フラット",
    concept: "影も装飾もない、面と線だけ",
    description:
      "影・グラデーション・角の丸みを最小限にし、罫線と塗りのコントラストだけで構成。番号つきの機能ブロックで、読み飛ばしても内容が拾える構成。",
    swatchClassName: "bg-white border-2 border-gray-900",
  },
  {
    slug: "saas",
    name: "SaaS シンプル",
    concept: "プロダクトとしての信頼感",
    description:
      "白基調・細い罫線・アプリ画面のモックで「使えば何ができるか」を最短で伝える構成。機能一覧とFAQで納得してもらう。",
    swatchClassName: "bg-gradient-to-br from-white to-gray-200",
  },
  {
    slug: "editorial",
    name: "エディトリアル",
    concept: "説明書のような落ち着き",
    description:
      "クリーム地に明朝体と罫線。機能を番号つきの目次形式で並べ、仕様書に近い密度で読ませる構成。",
    swatchClassName: "bg-[#f4f0e8] border border-stone-400",
  },
  {
    slug: "soft",
    name: "ソフト",
    concept: "スマホで気軽に使えるトーン",
    description:
      "大きめの角丸と薄いグレー面で、圧のない見た目に。スマホ画面のモックを中心に、操作イメージを掴ませる構成。",
    swatchClassName: "bg-gray-50 border border-gray-200",
  },
];
