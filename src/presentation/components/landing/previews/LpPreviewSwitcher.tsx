"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { LP_PREVIEW_THEMES } from "./lp-preview-themes";

/**
 * LP デザイン検証用のテーマ切り替えバー。
 * 本番 LP には載せず、/lp 配下でのみ表示する。
 *
 * @returns 画面下部に固定表示する切り替え UI
 */
export function LpPreviewSwitcher() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <nav className="pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-gray-200 bg-white/95 p-1.5 shadow-lg backdrop-blur">
        <Link
          href="/lp"
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors",
            pathname === "/lp"
              ? "bg-gray-900 text-white"
              : "text-gray-500 hover:bg-gray-100",
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          一覧
        </Link>
        <span aria-hidden className="h-5 w-px shrink-0 bg-gray-200" />
        {LP_PREVIEW_THEMES.map((theme) => {
          const href = `/lp/${theme.slug}`;
          const isActive = pathname === href;
          return (
            <Link
              key={theme.slug}
              href={href}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-gray-600 hover:bg-gray-100",
              )}
            >
              {theme.name}
            </Link>
          );
        })}
        <span aria-hidden className="h-5 w-px shrink-0 bg-gray-200" />
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          採用案（本番LP）
        </Link>
      </nav>
    </div>
  );
}
