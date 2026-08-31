import { headers } from 'next/headers';

import { HistoryBackButton } from '@/components/common/HistoryBackButton';
import { Footer } from '@/components/landing/Footer';
import { resolvePreferredLanguage } from '@/lib/language-preference';

export default async function TermsPage() {
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
                    {isEnglish ? 'Terms of Service' : '이용약관'}
                </h1>

                <div className="max-w-4xl space-y-8 text-sm leading-relaxed text-dim md:space-y-10">
                    {isEnglish ? (
                        <>
                            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                                <h2 className="mb-4 text-xl font-cinzel text-white">English Summary</h2>
                                <p>
                                    These terms explain how CosmicPath delivers CosmicPath Decision Note as digital content.
                                    Saju = structure, astrology = timing, tarot = immediate signal.
                                    This English summary is provided for clarity during the current validation cycle. The Korean governing version remains below.
                                </p>
                            </section>

                            <section className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                                    <h2 className="mb-3 text-lg font-cinzel text-white">What You Buy</h2>
                                    <p>
                                        The paid unlock is a one-time 7-Day Decision Packet (7일 결정 패킷) for $3.99 USD, purchased through Stripe checkout.
                                        It gives you access to deeper evidence, timing, next-action order, and risk framing.
                                    </p>
                                </div>
                                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                                    <h2 className="mb-3 text-lg font-cinzel text-white">Refund Boundary</h2>
                                    <p>
                                        For one-off detailed notes, a refund request may be limited once the note is generated or opened.
                                        If the content stays unopened, a refund request may be made within 7 days.
                                    </p>
                                </div>
                                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                                    <h2 className="mb-3 text-lg font-cinzel text-white">Decision Disclaimer</h2>
                                    <p>
                                        Decision notes are interpretive content with no guaranteed relationship, career, money, health, or life outcome.
                                        They are not therapy, medical, diagnostic, legal, or financial advice.
                                    </p>
                                </div>
                                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                                    <h2 className="mb-3 text-lg font-cinzel text-white">Governing Law</h2>
                                    <p>
                                        The service is operated in Korea and disputes are governed by Korean law. Contact: yongjl12@naver.com.
                                    </p>
                                </div>
                            </section>

                            <section className="rounded-3xl border border-white/10 bg-black/20 p-6">
                                <h2 className="mb-4 text-xl font-cinzel text-white">Korean Governing Version</h2>
                                <p>
                                    The Korean terms below remain the governing version for this stage of the product.
                                </p>
                            </section>
                        </>
                    ) : null}

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-white">제1조 (목적)</h2>
                        <p>이 약관은 토니스컴퍼니(이하 &quot;회사&quot;)가 운영하는 &quot;오늘의 결정 정리&quot; 및 관련 서비스(이하 &quot;서비스&quot;)에서 제공하는 디지털 콘텐츠 및 인터넷 관련 서비스를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-white">제2조 (용어의 정의)</h2>
                        <ol className="list-decimal space-y-2 pl-5">
                            <li>&quot;서비스&quot;란 회사가 이용자에게 제공하는 의사결정 보조 콘텐츠, 사주, 점성술, 자미두수 및 수비학 기반 참고 해석 및 관련 콘텐츠 일체를 의미합니다.</li>
                            <li>&quot;이용자&quot;란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                            <li>&quot;유료 콘텐츠&quot;란 이용자가 서비스를 이용함에 있어 별도의 대가를 지불하고 구매하는 디지털 상품(7일 결정 패킷 등)을 의미합니다.</li>
                            <li>&quot;결제&quot;란 이용자가 유료 콘텐츠를 이용하기 위하여 회사가 정한 결제 수단을 통해 일정 금액을 지불하는 행위를 의미합니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-white">제3조 (회사정보 등의 제공)</h2>
                        <p>회사는 다음 각 호의 사항을 이용자가 알 수 있도록 서비스 내에 게시합니다.</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                            <li>상호 및 대표자의 성명: 토니스컴퍼니 / 김영광</li>
                            <li>영업소 소재지 주소: 경기도 부천시 오정로253</li>
                            <li>사업자등록번호: 832-56-01010</li>
                            <li>전자우편주소: yongjl12@naver.com</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-white">제4조 (약관의 효력 및 변경)</h2>
                        <ol className="list-decimal space-y-2 pl-5">
                            <li>회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</li>
                            <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있습니다.</li>
                            <li>약관을 변경할 경우 회사는 적용일자 및 변경사유를 명시하여 현행 약관과 함께 서비스 내에 공지합니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-white">제5조 (서비스의 내용 및 변경)</h2>
                        <ol className="list-decimal space-y-2 pl-5">
                            <li>회사는 의사결정 보조 기록과 사주명리학, 점성술, 자미두수, 수비학 참고 해석을 디지털 콘텐츠 형태로 제공합니다.</li>
                            <li>오늘의 결정 정리는 이용자가 입력한 선택에 대한 참고용 방향과 근거를 제공하며, 상대의 답장, 재회, 커리어, 금전, 건강, 인생 결과를 보장하지 않습니다.</li>
                            <li>사주는 구조, 점성술은 타이밍, 자미두수는 사건 배치를 보조하며 상품명 또는 결과 보장의 근거가 아닙니다.</li>
                            <li>회사는 서비스 개선 또는 운영상 상당한 이유가 있는 경우 서비스의 전부 또는 일부를 수정, 변경, 중단할 수 있습니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-white">제6조 (정보의 제공 및 광고 게재)</h2>
                        <ol className="list-decimal space-y-2 pl-5">
                            <li>회사는 서비스 이용 중 필요하다고 인정되는 다양한 정보를 공지사항이나 이메일, 알림톡 등의 방법으로 이용자에게 제공할 수 있습니다.</li>
                            <li>회사는 서비스 화면, 홈페이지 등에 광고를 게재할 수 있습니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-white">제7조 (유료 콘텐츠의 구매 및 결제)</h2>
                        <ol className="list-decimal space-y-2 pl-5">
                            <li>이용자는 회사가 제공하는 결제 방식(신용카드, 간편결제 등)을 통해 유료 콘텐츠를 구매할 수 있습니다.</li>
                            <li>7일 결정 패킷은 Stripe checkout을 통해 $3.99 USD의 단건 디지털 리포트로 제공됩니다.</li>
                            <li>결제와 관련된 보안 책임은 이용자에게 있으며, 이용자의 부주의로 인한 결제 정보 노출에 대해 회사는 책임을 지지 않습니다.</li>
                            <li>회사는 정책 및 결제 업체의 기준에 따라 결제 수단별 결제 한도를 부여할 수 있습니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-accent-gold">제8조 (청약 철회 및 환불)</h2>
                        <ol className="list-decimal space-y-2 pl-5">
                            <li>전자상거래법 제17조 제2항에 따라, <strong>디지털 콘텐츠의 분석이 시작되었거나 결과가 생성된 경우</strong>에는 다시 판매하기 곤란한 가치가 있는 것으로 보아 청약 철회가 제한됩니다.</li>
                            <li>단건 디지털 노트는 결과가 생성되었거나 열람된 뒤 환불 요청이 제한될 수 있습니다.</li>
                            <li>이용자는 구매 후 콘텐츠를 열람하지 않은 상태에서 7일 이내에 청약 철회를 요청할 수 있습니다.</li>
                            <li>회사의 귀책 사유로 서비스를 정상적으로 이용하지 못한 경우 회사는 결제 금액을 전액 환불합니다.</li>
                            <li>무료로 지급받은 포인트, 쿠폰, 이벤트 당첨 상품 등은 환불 대상에서 제외됩니다.</li>
                            <li>환불은 이용자가 결제한 수단과 동일한 방법으로 처리함을 원칙으로 합니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-white">제9조 (이용자의 의무 및 제한)</h2>
                        <p>이용자는 다음 행위를 하여서는 안 됩니다:</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                            <li>회사의 저작권 및 제3자의 지적재산권 침해</li>
                            <li>분석 결과를 무단으로 복제, 배포, 판매하는 행위</li>
                            <li>타인의 결제 정보를 도용하는 행위</li>
                            <li>회사의 서비스 운영에 지장을 주는 해킹 또는 매크로 사용</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-accent-gold">제10조 (면책 조항)</h2>
                        <ol className="list-decimal space-y-2 pl-5">
                            <li>회사는 천재지변, 전시, 사변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제되니다.</li>
                            <li><strong>본 서비스의 분석 결과는 참고용 해석일 뿐이며, 이용자의 실제 운기나 미래, 상대방의 답장 또는 관계 결과를 보장하지 않습니다.</strong> 이용자는 결과를 참고용으로만 활용해야 하며, 이를 근거로 내린 중대한 결정에 대한 법적 책임은 이용자 본인에게 있습니다.</li>
                            <li>본 서비스는 심리치료, 의료, 진단, 법률, 금융 자문이 아니며, 전문적 도움이 필요한 사안은 해당 자격을 갖춘 전문가에게 문의해야 합니다.</li>
                            <li>상대방에게 압박을 주는 메시지, 감시, 반복 확인, 스토킹성 행동을 권장하지 않습니다.</li>
                            <li>회사는 이용자의 단말기 환경이나 네트워크 문제로 발생한 이용 장애에 대해 책임을 지지 않습니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-white">제11조 (카카오톡 알림톡 및 메시지 발송)</h2>
                        <p>회사는 서비스 이용 과정(결제 확인, 노트 도착 등)에서 발생하는 주요 정보를 카카오톡 알림톡 또는 SMS로 발송할 수 있습니다. 데이터 요금이 발생할 수 있으며, 수신을 원치 않으실 경우 알림톡 하단의 차단을 통해 수신 거부가 가능합니다.</p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-cinzel text-white">제12조 (준거법 및 재판권)</h2>
                        <ol className="list-decimal space-y-2 pl-5">
                            <li>회사와 이용자 간에 발생한 분쟁은 대한민국 법을 준거법으로 합니다.</li>
                            <li>서비스 이용과 관련된 소송은 민사소송법상 관할 법원을 제1심 법원으로 합니다.</li>
                        </ol>
                    </section>

                    <section className="border-t border-white/10 pt-10 opacity-50">
                        <p>공고일자: 2025년 1월 1일</p>
                        <p>시행일자: 2025년 1월 1일</p>
                    </section>
                </div>
            </div>
            <Footer language={language} />
        </main>
    );
}
