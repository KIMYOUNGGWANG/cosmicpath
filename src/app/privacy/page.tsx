import { headers } from 'next/headers';

import { HistoryBackButton } from '@/components/common/HistoryBackButton';
import { Footer } from '@/components/landing/Footer';
import { resolvePreferredLanguage } from '@/lib/language-preference';

export default async function PrivacyPage() {
    const headerStore = await headers();
    const language = resolvePreferredLanguage(headerStore.get('accept-language'));
    const isEnglish = language === 'en';

    return (
        <main className="min-h-screen bg-void font-outfit text-starlight">
            <div className="container-cosmic px-4 py-12 md:px-6 md:py-20">
                <div className="mb-10 flex items-center">
                    <HistoryBackButton label={isEnglish ? 'Back' : '뒤로'} />
                </div>

                <h1 className="mb-8 text-3xl font-cinzel text-accent-gold md:mb-12 md:text-5xl">
                    {isEnglish ? 'Privacy Policy' : '개인정보처리방침'}
                </h1>

                <div className="max-w-4xl space-y-8 text-sm leading-relaxed text-dim md:space-y-10">
                    {isEnglish ? (
                        <>
                            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                                <h2 className="mb-4 text-xl font-cinzel text-white">English Summary</h2>
                                <p>
                                    This English summary explains what personal information CosmicPath collects during the current validation cycle.
                                    The product may process decision context that you type, optional birth data, and technical data for note restore and storage.
                                    CosmicPath Decision Note may also create a bounded Next Move Ritual action and a public-safe share summary without exposing raw inputs by default.
                                    The Korean governing version remains below for legal reference.
                                </p>
                            </section>

                            <section className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                                    <h2 className="mb-3 text-lg font-cinzel text-white">What We Collect</h2>
                                    <p>
                                        We may collect your question, decision context, optional birth data, nickname, email, payment confirmation data, and technical access data such as device type, IP, cookies, and language.
                                    </p>
                                </div>
                                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                                    <h2 className="mb-3 text-lg font-cinzel text-white">Why We Use It</h2>
                                    <p>
                                        The data is used to prepare decision notes, create bounded ritual actions, deliver paid content, support note restore and storage, prevent abuse, prepare public-safe sharing, and improve the service through analytics.
                                    </p>
                                </div>
                                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                                    <h2 className="mb-3 text-lg font-cinzel text-white">Sensitive Details</h2>
                                    <p>
                                        Please do not paste highly sensitive third-party secrets, private identifiers, passwords, addresses, or screenshots from another person&apos;s private account. Public share surfaces are designed around safe summaries, not raw questions or birth data.
                                    </p>
                                </div>
                                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                                    <h2 className="mb-3 text-lg font-cinzel text-white">Retention and Processors</h2>
                                    <p>
                                        Some records are retained to meet Korean legal requirements. Payment, email delivery, hosting, and analytics may involve Stripe, AWS, Resend, and Google.
                                    </p>
                                </div>
                            </section>

                            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                                <h2 className="mb-3 text-lg font-cinzel text-white">Contact</h2>
                                <p>
                                    If you need access, correction, or deletion support, contact the privacy manager at yongjl12@naver.com.
                                </p>
                            </section>

                            <section className="rounded-3xl border border-white/10 bg-black/20 p-6">
                                <h2 className="mb-4 text-xl font-cinzel text-white">Korean Governing Version</h2>
                                <p>
                                    The Korean policy below remains the governing version for this stage of the product.
                                </p>
                            </section>
                        </>
                    ) : null}

                    <p>
                        토니스컴퍼니(이하 &quot;회사&quot;)는 「개인정보 보호법」 및 관련 법령에 따라 이용자의 개인정보를 보호하고 관련 고충을 신속하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.
                    </p>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-white">1. 수집하는 개인정보 항목 및 수집방법</h2>
                        <p className="mb-4">회사는 원활한 서비스 제공을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
                        <div className="overflow-x-auto px-4 md:mx-0 md:px-0">
                            <table className="min-w-[500px] w-full border-collapse border border-white/10 text-left">
                                <thead>
                                    <tr className="bg-white/5 text-white/70">
                                        <th className="border border-white/10 p-4 text-xs uppercase tracking-wider">수집 범주</th>
                                        <th className="border border-white/10 p-4 text-xs uppercase tracking-wider">항목</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="transition-colors hover:bg-white/[0.02]">
                                        <td className="border border-white/10 p-4 font-medium">분석 서비스 이용 (필수)</td>
                                        <td className="border border-white/10 p-4">질문 내용, 결정 맥락, 닉네임, 생년월일, 출생시간, 성별, 태어난 장소(선택 시)</td>
                                    </tr>
                                    <tr className="transition-colors hover:bg-white/[0.02]">
                                        <td className="border border-white/10 p-4 font-medium">결정 정리 선택 정보</td>
                                        <td className="border border-white/10 p-4">결정 보조를 위해 입력한 상황 설명, 메시지 초안, 선택적 출생정보, 선택적 타로 선택 정보, Next Move Ritual 행동 및 공개 안전 공유 요약</td>
                                    </tr>
                                    <tr className="transition-colors hover:bg-white/[0.02]">
                                        <td className="border border-white/10 p-4 font-medium">결제 및 결과 발송 (선택)</td>
                                        <td className="border border-white/10 p-4">이메일 주소, 결제 승인 정보 (PG사 제공 범위)</td>
                                    </tr>
                                    <tr className="transition-colors hover:bg-white/[0.02]">
                                        <td className="border border-white/10 p-4 font-medium">기기 및 접속 정보 (자동)</td>
                                        <td className="border border-white/10 p-4">IP 주소, 쿠키, 방문 일시, 기기 정보(OS, 모델명, 언어)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-white">2. 개인정보의 처리 목적</h2>
                        <ul className="list-disc space-y-2 pl-5">
                            <li><strong>결정 정리 노트 제공:</strong> 의사결정 보조 노트와 선택적 사주/점성술/타로 참고 해석 생성 및 전송</li>
                            <li><strong>노트 복원 및 보관:</strong> 결제 후 결과 조회, 저장된 노트 복원, 고객 지원을 위한 최소 정보 확인</li>
                            <li><strong>회원 관리:</strong> 서비스 이용에 따른 본인 확인 및 부정 이용 방지</li>
                            <li><strong>결제 및 정산:</strong> 유료 콘텐츠 대금 결제 및 환불 처리</li>
                            <li><strong>안전한 공유:</strong> 공개 공유 화면에서는 원문 질문, 생년월일, 상세 입력 대신 안전 요약과 제한된 행동 문구만 표시</li>
                            <li><strong>서비스 개선:</strong> 신규 서비스 개발 및 이용 통계 분석</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-white">2-1. 결정 맥락 입력 시 주의사항</h2>
                        <p>
                            오늘의 결정 정리는 이용자가 직접 입력한 결정 맥락을 바탕으로 참고용 방향과 근거를 정리합니다.
                            Next Move Ritual 행동은 결과를 보장하지 않는 작고 안전한 다음 행동으로만 제공되며, 공개 공유 기본값은 원문 질문과 생년월일을 노출하지 않는 요약입니다.
                            타인의 주민등록번호, 연락처, 주소, 비밀번호, 계정 화면, 사적인 대화 전문 등 고도로 민감한 제3자 비밀은 입력하지 마십시오.
                            필요한 경우 상대방을 식별할 수 없는 별명이나 요약문으로 바꾸어 입력해 주세요.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-white">3. 개인정보의 보유 및 이용 기간</h2>
                        <p>회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우 아래 기간 동안 보관합니다.</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                            <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
                            <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
                            <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
                            <li>서비스 접속 기록: 3개월 (통신비밀보호법)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-white">4. 개인정보의 처리 위탁 (Outsourcing)</h2>
                        <p>회사는 안정적인 서비스 제공을 위해 아래 회사에 개인정보 처리 업무를 위탁하고 있습니다. 위탁 시 관련 법령에 따라 수탁자가 개인정보를 안전하게 처리하도록 관리·감독합니다.</p>
                        <ul className="mt-2 list-disc space-y-2 pl-5">
                            <li><strong>결제 처리:</strong> 제이씨아이(Stripe 등 해외 결제 대행 포함) - 결제 승인 및 취소</li>
                            <li><strong>이메일 발송:</strong> AWS (Amazon Web Services), Resend 등 - 노트 및 안내 메일 발송</li>
                            <li><strong>데이터 분석:</strong> Google (Google Analytics) - 서비스 이용 통계 분석</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-white">5. 개인정보의 파기 절차 및 방법</h2>
                        <ol className="list-decimal space-y-2 pl-5">
                            <li><strong>파기 절차:</strong> 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 법령에 따른 일정 기간 보관된 후 파기됩니다.</li>
                            <li><strong>파기 방법:</strong> 전자적 파일은 재생할 수 없는 기술적 방법을 사용하여 삭제하며, 종이 문서는 분쇄하거나 소각합니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-white">6. 정보주체의 권리·의무 및 그 행사 방법</h2>
                        <p>이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제 요청할 수 있습니다. 개인정보 보호책임자에게 서면 또는 이메일로 연락하시면 지체 없이 조치하겠습니다.</p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-white">7. 개인정보 자동 수집 장치의 설치·운영 및 그 거부에 관한 사항</h2>
                        <p>회사는 이용자에게 맞춤화된 서비스를 제공하기 위해 ‘쿠키(cookie)’를 사용합니다. 쿠키는 이용자의 하드디스크에 저장되는 작은 텍스트 파일입니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 서비스 이용에 제한이 있을 수 있습니다.</p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-white">8. 개인정보 보호책임자</h2>
                        <div className="mt-2 rounded border border-white/10 bg-white/5 p-6">
                            <p>회사는 이용자의 개인정보를 보호하고 관련 민원을 처리하기 위하여 아래와 같이 보호책임자를 지정하고 있습니다.</p>
                            <div className="mt-4 space-y-1 text-white">
                                <p><strong>성명: 김영광</strong></p>
                                <p>직함: 대표 / 보호책임자</p>
                                <p>이메일: yongjl12@naver.com</p>
                            </div>
                        </div>
                    </section>

                    <section className="border-t border-white/10 pt-10 opacity-50">
                        <p>최초 공고일자: 2025년 1월 1일</p>
                        <p>최종 시행일자: 2025년 1월 1일</p>
                    </section>
                </div>
            </div>
            <Footer language={language} />
        </main>
    );
}
