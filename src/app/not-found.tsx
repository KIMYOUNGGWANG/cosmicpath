import Link from "next/link";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute top-10 left-10 w-96 h-96 bg-purple-900/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-900/30 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 text-center space-y-8 max-w-lg">
                {/* glitched 404 text */}
                <h1 className="text-[120px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 select-none font-cinzel">
                    404
                </h1>

                <div className="space-y-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-white/90">
                        우주에서 길을 잃으셨나요?
                    </h2>
                    <p className="text-white/60 leading-relaxed font-light">
                        요청하신 페이지는 블랙홀 너머로 사라졌거나 존재하지 않는 좌표입니다.
                        <br />
                        올바른 궤도로 다시 진입하시기 바랍니다.
                    </p>
                </div>

                <div className="pt-8">
                    <Link
                        href="/"
                        className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-105"
                    >
                        <MoveLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium tracking-wide">
                            메인 궤도로 복귀
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
