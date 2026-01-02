'use client';

import { Footer } from '@/components/landing/Footer';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-void text-starlight font-outfit">
            <div className="container-cosmic py-12 md:py-20 px-4 md:px-6">
                {/* Navigation */}
                <div className="mb-10 flex items-center">
                    <button
                        onClick={() => window.history.back()}
                        className="text-white/50 hover:text-white flex items-center gap-2 group transition-all text-sm tracking-widest uppercase font-cinzel"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        Back
                    </button>
                </div>

                <h1 className="text-3xl md:text-5xl font-cinzel text-accent-gold mb-8 md:mb-12">개인정보처리방침</h1>

                <div className="space-y-8 md:space-y-10 text-dim text-sm leading-relaxed max-w-4xl">
                    <p>
                        토니스컴퍼니(이하 "회사")는 「개인정보 보호법」 및 관련 법령에 따라 이용자의 개인정보를 보호하고 관련 고충을 신속하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.
                    </p>

                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4">1. 수집하는 개인정보 항목 및 수집방법</h2>
                        <p className="mb-4">회사는 원활한 서비스 제공을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
                        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                            <table className="w-full text-left border-collapse border border-white/10 min-w-[500px]">
                                <thead>
                                    <tr className="bg-white/5 text-white/70">
                                        <th className="p-4 border border-white/10 text-xs uppercase tracking-wider">수집 범주</th>
                                        <th className="p-4 border border-white/10 text-xs uppercase tracking-wider">항목</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 border border-white/10 font-medium">분석 서비스 이용 (필수)</td>
                                        <td className="p-4 border border-white/10">닉네임, 생년월일, 출생시간, 성별, 태어난 장소(선택 시)</td>
                                    </tr>
                                    <tr className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 border border-white/10 font-medium">결제 및 결과 발송 (선택)</td>
                                        <td className="p-4 border border-white/10">이메일 주소, 결제 승인 정보 (PG사 제공 범위)</td>
                                    </tr>
                                    <tr className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 border border-white/10 font-medium">기기 및 접속 정보 (자동)</td>
                                        <td className="p-4 border border-white/10">IP 주소, 쿠키, 방문 일시, 기기 정보(OS, 모델명, 언어)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4">2. 개인정보의 처리 목적</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>분석 리포트 제공:</strong> AI 기반 사주/점성술/타로 리포트 생성 및 전송</li>
                            <li><strong>회원 관리:</strong> 서비스 이용에 따른 본인 확인 및 부정 이용 방지</li>
                            <li><strong>결제 및 정산:</strong> 유료 콘텐츠 대금 결제 및 환불 처리</li>
                            <li><strong>서비스 개선:</strong> 신규 서비스 개발 및 이용 통계 분석</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4">3. 개인정보의 보유 및 이용 기간</h2>
                        <p>회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우 아래 기간 동안 보관합니다.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
                            <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
                            <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
                            <li>서비스 접속 기록: 3개월 (통신비밀보호법)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4">4. 개인정보의 처리 위탁 (Outsourcing)</h2>
                        <p>회사는 안정적인 서비스 제공을 위해 아래 회사에 개인정보 처리 업무를 위탁하고 있습니다. 위탁 시 관련 법령에 따라 수탁자가 개인정보를 안전하게 처리하도록 관리·감독합니다.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li><strong>결제 처리:</strong> 제이씨아이(Stripe 등 해외 결제 대행 포함) - 결제 승인 및 취소</li>
                            <li><strong>이메일 발송:</strong> AWS (Amazon Web Services), Resend 등 - 리포트 및 안내 메일 발송</li>
                            <li><strong>데이터 분석:</strong> Google (Google Analytics) - 서비스 이용 통계 분석</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4">5. 개인정보의 파기 절차 및 방법</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li><strong>파기 절차:</strong> 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 법령에 따른 일정 기간 보관된 후 파기됩니다.</li>
                            <li><strong>파기 방법:</strong> 전자적 파일은 재생할 수 없는 기술적 방법을 사용하여 삭제하며, 종이 문서는 분쇄하거나 소각합니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4">6. 정보주체의 권리·의무 및 그 행사 방법</h2>
                        <p>이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제 요청할 수 있습니다. 개인정보 보호책임자에게 서면 또는 이메일로 연락하시면 지체 없이 조치하겠습니다.</p>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4">7. 개인정보 자동 수집 장치의 설치·운영 및 그 거부에 관한 사항</h2>
                        <p>회사는 이용자에게 맞춤화된 서비스를 제공하기 위해 ‘쿠키(cookie)’를 사용합니다. 쿠키는 이용자의 하드디스크에 저장되는 작은 텍스트 파일입니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 서비스 이용에 제한이 있을 수 있습니다.</p>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4">8. 개인정보 보호책임자</h2>
                        <div className="mt-2 p-6 bg-white/5 rounded border border-white/10">
                            <p>회사는 이용자의 개인정보를 보호하고 관련 민원을 처리하기 위하여 아래와 같이 보호책임자를 지정하고 있습니다.</p>
                            <div className="mt-4 space-y-1 text-white">
                                <p><strong>성명: 김영광</strong></p>
                                <p>직함: 대표 / 보호책임자</p>
                                <p>이메일: yongjl12@naver.com</p>
                            </div>
                        </div>
                    </section>

                    <section className="pt-10 border-t border-white/10 opacity-50">
                        <p>최초 공고일자: 2025년 1월 1일</p>
                        <p>최종 시행일자: 2025년 1월 1일</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
