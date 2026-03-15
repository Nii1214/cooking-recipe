"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/top/logout-action";
import { LogOut, Plus } from "lucide-react";

type Props = {
  user: User | null;
};

export function HeaderActions({ user }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          ログイン
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 rounded-full text-white transition-colors"
        >
          新規登録
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/recipe/new"
        className="sm:hidden flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
      >
        <Plus className="w-4 h-4" />
      </Link>
      <button
        onClick={handleLogout}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">
          {isPending ? "ログアウト中..." : "ログアウト"}
        </span>
      </button>
    </div>
  );
}
