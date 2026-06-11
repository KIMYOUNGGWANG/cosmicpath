export function PaymentSuccessFallback() {
    return (
        <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl text-center">
            <div className="space-y-4">
                <div className="w-12 h-12 border-4 border-[#A184FF] border-t-transparent rounded-full animate-spin mx-auto" />
                <h1 className="text-xl font-bold text-white">결제 정보 로드 중... / Loading payment details...</h1>
            </div>
        </div>
    );
}
