import Link from "next/link";
import { BookOpen, Shield, Users, Heart } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-[calc(100vh-4rem)]">
            {/* Hero */}
            <section className="relative overflow-hidden bg-[#faf8f5] border-b border-amber-100/80">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,#fef3e2_0%,transparent_60%)]" aria-hidden />
                <div className="relative max-w-4xl mx-auto px-6 py-20 sm:py-28 text-center">
                    <p className="text-amber-700/90 text-sm font-medium tracking-wider uppercase mb-4">
                        Family Recipe Archive
                    </p>
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#3d3834] leading-tight tracking-tight">
                        家族の味と思い出を、
                        <br />
                        一緒に残す。
                    </h1>
                    <p className="mt-6 text-lg sm:text-xl text-[#5c5650] max-w-2xl mx-auto leading-relaxed">
                        閉じた空間で、家族だけのレシピと記憶を蓄え、
                        <br className="hidden sm:block" />
                        次の世代へ。
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/signup"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-600 px-8 py-4 text-base font-semibold text-white shadow-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
                        >
                            <BookOpen className="size-5" />
                            はじめる
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center rounded-full border-2 border-amber-200 bg-white/80 px-8 py-4 text-base font-semibold text-amber-800 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
                        >
                            ログイン
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why */}
            <section className="py-16 sm:py-24 bg-white">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="font-serif text-2xl sm:text-3xl text-[#3d3834] text-center mb-4">
                        なぜ、このプロダクトがあるのか
                    </h2>
                    <p className="text-center text-[#5c5650] leading-relaxed mb-12 max-w-2xl mx-auto">
                        料理は誰しもが関わる営み。けれど、家族が疎遠になったり、
                        親世代が亡くなると、あの味が再現できなくなる。
                    </p>
                    <p className="text-center text-lg text-[#3d3834] font-medium max-w-xl mx-auto">
                        「料理」という共通体験を通じて、
                        <br />
                        家族のつながりを保存・再構築する。
                    </p>
                </div>
            </section>

            {/* Three pillars */}
            <section className="py-16 sm:py-24 bg-[#faf8f5] border-y border-amber-100/60">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="font-serif text-2xl sm:text-3xl text-[#3d3834] text-center mb-12">
                        3つの考え方
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-8 sm:gap-10">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100/80 text-amber-800 mb-4">
                                <Shield className="size-7" />
                            </div>
                            <h3 className="font-serif text-xl text-[#3d3834] mb-2">閉じた環境</h3>
                            <p className="text-sm text-[#5c5650] leading-relaxed">
                                家族単位で完全に分離。他家族のデータにはアクセスできません。離乳食などセンシティブな内容も安心して残せます。
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100/80 text-amber-800 mb-4">
                                <Users className="size-7" />
                            </div>
                            <h3 className="font-serif text-xl text-[#3d3834] mb-2">家族の資産</h3>
                            <p className="text-sm text-[#5c5650] leading-relaxed">
                                レシピは「個人」ではなく「家族の資産」。個人の不在でも、招待済み家族が引き継ぎ、味を途切れさせません。
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100/80 text-amber-800 mb-4">
                                <Heart className="size-7" />
                            </div>
                            <h3 className="font-serif text-xl text-[#3d3834] mb-2">思い出と共に</h3>
                            <p className="text-sm text-[#5c5650] leading-relaxed">
                                レシピだけでなく、失敗談・エピソード・写真。料理越しに孫の写真を見る、そんなコミュニケーションを想定しています。
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Data & Trust */}
            <section className="py-16 sm:py-24 bg-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="font-serif text-2xl sm:text-3xl text-[#3d3834] mb-6">
                        データと信頼
                    </h2>
                    <p className="text-[#5c5650] leading-relaxed max-w-2xl mx-auto mb-8">
                        Write Once, Read Forever。バックアップ・エクスポート・サービス終了時のデータ持ち出しまで、
                        ユーザーのデータ主権を重視した設計です。
                    </p>
                    <p className="text-[#5c5650] text-sm max-w-xl mx-auto">
                        データ販売・行動トラッキング広告は行いません。
                        収益よりも「信頼」を優先しています。
                    </p>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 sm:py-24 bg-[#faf8f5] border-t border-amber-100/60">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <p className="font-serif text-2xl sm:text-3xl text-[#3d3834] mb-6">
                        家族の味は、消耗品ではなく
                        <br />
                        「記憶資産」である。
                    </p>
                    <p className="text-[#5c5650] mb-10">
                        それを守るための場所を、一緒に育てていきませんか。
                    </p>
                    <Link
                        href="/signup"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-600 px-10 py-4 text-base font-semibold text-white shadow-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
                    >
                        <BookOpen className="size-5" />
                        ファミリー味帳をはじめる
                    </Link>
                </div>
            </section>
        </div>
    );
}
