export type TopPreviewVariant = {
  slug: string;
  name: string;
  concept: string;
  headline: string;
  /** 見出し下の本文。空配列なら本文なし。2 要素の場合は sm 以上でのみ改行する */
  bodyLines: string[];
  description: string;
  /** この案が向いている状況 */
  suitedFor: string;
};

/**
 * TOP 画面ヒーローのコピー案。デザインは現行のまま、文言だけを差し替える。
 * /top-preview 配下のルートと 1:1 で対応する。
 */
export const TOP_PREVIEW_VARIANTS: TopPreviewVariant[] = [
  {
    slug: "current",
    name: "変更前",
    concept: "プロダクトの価値を語る",
    headline: "家族の味を、ここに残そう",
    bodyLines: [
      "おばあちゃんの煮物、パパの特製カレー、週末のホットケーキ——",
      "大切な家族のレシピを、みんなで守り、つないでいく場所です。",
    ],
    description:
      "LP と同じ価値訴求をログイン後にも置いていた、差し替え前のコピー。初回は響くが、毎日開くと同じ説明を読み続けることになる。",
    suitedFor: "登録直後など、まだ使い方が定着していない時期",
  },
  {
    slug: "question",
    name: "問いかけ",
    concept: "その日の行動を促す",
    headline: "今日は何をつくる？",
    bodyLines: ["家族のレシピから選ぶか、新しい一品を増やしていきましょう。"],
    description:
      "説明をやめて問いかけに変える。毎日開いても意味を持つ一文で、下のレシピ一覧へ視線を送る。",
    suitedFor: "毎日の献立決めの起点として使ってほしい場合",
  },
  {
    slug: "welcome",
    name: "出迎え",
    concept: "帰ってきた人を迎える",
    headline: "おかえりなさい",
    bodyLines: ["いつもの味も、はじめての一品も。今日のごはんはここから。"],
    description:
      "商品説明でも指示でもなく、ただ迎える。温かみを残したまま、読む負担がいちばん軽い。",
    suitedFor: "家族の共有スペースとしての居心地を優先する場合",
  },
  {
    slug: "growth",
    name: "積み重ね",
    concept: "続けてきたことを認める",
    headline: "うちの味が、少しずつ増えています",
    bodyLines: [
      "つくったら気づいたことを書き足して、家族のレシピを育てていきましょう。",
    ],
    description:
      "これから始める話ではなく、すでに貯まっているものを肯定する。下の統計カードの数字と意味がつながる。",
    suitedFor: "レシピが貯まってきて、続けている実感を返したい場合",
  },
  {
    slug: "plain",
    name: "実用（採用）",
    concept: "見出し 1 行だけにする",
    headline: "家族のレシピ帳",
    bodyLines: [],
    description:
      "説明文を持たず、この画面が何かを示す見出しだけを置く。読ませる文章がないぶん、下のボタンとレシピ一覧に視線が向く。",
    suitedFor: "コピーで語ること自体をやめたい場合",
  },
];
