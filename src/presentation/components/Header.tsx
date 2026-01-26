`use client`
export default function Header() {
    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between bg-white px-6">
                <div className="flex items-center gap-8">
                    <span className="font-bold text-xl tracking-tight shrink-0">Cooking Recipe</span>
                    <input
                        type="text"
                        placeholder="なにつくる？（実装予定）"
                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-4 py-2 text-sm font-bold bg-orange-600 hover:bg-orange-300 rounded-full text-sm font-medium text-white transition-colors">ログイン</button>
                </div>
            </header>
        </>
    )
}