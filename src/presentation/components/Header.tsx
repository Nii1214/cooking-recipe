import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeaderActions } from "./HeaderActions";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between bg-white/95 backdrop-blur-sm px-6 border-b border-gray-200">
      <div className="flex items-center gap-6">
        <Link
          href={user ? "/top" : "/"}
          className="font-serif font-bold text-xl tracking-tight shrink-0 text-gray-900 hover:text-emerald-700 transition-colors"
        >
          ファミリー味帳
        </Link>
        {user && (
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/top"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
            >
              レシピ一覧
            </Link>
            <Link
              href="/recipe/new"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
            >
              レシピ登録
            </Link>
          </nav>
        )}
      </div>
      <HeaderActions user={user} />
    </header>
  );
}
