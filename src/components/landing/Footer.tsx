export function Footer() {
    return (
        <footer className="py-12 bg-void border-t border-white/5">
            <div className="container-cosmic flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="font-cinzel text-starlight text-lg tracking-widest">
                    COSMIC PATH
                </div>

                <div className="flex gap-8 text-xs text-dim tracking-widest uppercase">
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                </div>

                <div className="text-dim text-[10px] font-mono">
                    © 2025 Cosmic Path. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
