import type { Metadata } from "next";
import { LpPreviewSwitcher } from "@/presentation/components/landing/previews/LpPreviewSwitcher";

export const metadata: Metadata = {
  title: "LP デザイン検証",
  robots: { index: false, follow: false },
};

/**
 * LP デザイン案の検証用レイアウト。テーマ切り替えバーを常時表示する。
 *
 * @param children 各テーマのページ
 * @returns 切り替えバー付きのレイアウト
 */
export default function LpPreviewLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <LpPreviewSwitcher />
    </>
  );
}
