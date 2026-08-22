import type { Metadata } from "next";
import { TopPreviewSwitcher } from "@/presentation/components/recipe/previews/TopPreviewSwitcher";

export const metadata: Metadata = {
  title: "TOP ヒーロー デザイン検証",
  robots: { index: false, follow: false },
};

/**
 * TOP 画面ヒーロー案の検証用レイアウト。案の切り替えバーを常時表示する。
 *
 * @param children 各案のページ
 * @returns 切り替えバー付きのレイアウト
 */
export default function TopPreviewLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <TopPreviewSwitcher />
    </>
  );
}
