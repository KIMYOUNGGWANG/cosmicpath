'use client';

import { Footer } from '@/components/landing/Footer';
import Link from 'next/link';

export default function TermsPage() {
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

                <h1 className="text-3xl md:text-5xl font-cinzel text-accent-gold mb-8 md:mb-12">이용약관</h1>

                <div className="space-y-8 md:space-y-10 text-dim text-sm leading-relaxed max-w-4xl">
                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4">제1조 (목적)</h2>
                        <p>이 약관은 토니스컴퍼니(이하 "회사")가 운영하는 "CosmicPath" 및 관련 서비스(이하 "서비스")에서 제공하는 디지털 콘텐츠 및 인터넷 관련 서비스를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4">제2조 (용어의 정의)</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>"서비스"란 회사가 이용자에게 제공하는 사주, 점성술, 타로 기반 AI 분석 결과 및 관련 콘텐츠 일체를 의미합니다.</li>
                            <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                            <li>"유료 콘텐츠"란 이용자가 서비스를 이용함에 있어 별도의 대가를 지불하고 구매하는 디지털 상품(심층 리포트 등)을 의미합니다.</li>
                            <li>"결제"란 이용자가 유료 콘텐츠를 이용하기 위하여 회사가 정한 결제 수단을 통해 일정 금액을 지불하는 행위를 의미합니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4">제3조 (회사정보 등의 제공)</h2>
                        <p>회사는 다음 각 호의 사항을 이용자가 알 수 있도록 서비스 내에 게시합니다.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>상호 및 대표자의 성명: 토니스컴퍼니 / 김영광</li>
                            <li>영업소 소재지 주소: 경기도 부천시 오정로253</li>
                            <li>사업자등록번호: 832-56-01010</li>
                            <li>전자우편주소: yongjl12@naver.com</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4">제4조 (약관의 효력 및 변경)</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</li>
                            <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있습니다.</li>
                            <li>약관을 변경할 경우 회사는 적용일자 및 변경사유를 명시하여 현행 약관과 함께 서비스 내에 공지합니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4">제5조 (서비스의 내용 및 변경)</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>회사는 AI 기술을 활용한 사주명리학, 점성술, 타로 분석 결과를 디지털 콘텐츠 형태로 제공합니다.</li>
                            <li>회사는 서비스 개선 또는 운영상 상당한 이유가 있는 경우 서비스의 전부 또는 일부를 수정, 변경, 중단할 수 있습니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4">제6조 (정보의 제공 및 광고 게재)</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>회사는 서비스 이용 중 필요하다고 인정되는 다양한 정보를 공지사항이나 이메일, 알림톡 등의 방법으로 이용자에게 제공할 수 있습니다.</li>
                            <li>회사는 서비스 화면, 홈페이지 등에 광고를 게재할 수 있습니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4">제7조 (유료 콘텐츠의 구매 및 결제)</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>이용자는 회사가 제공하는 결제 방식(신용카드, 간편결제 등)을 통해 유료 콘텐츠를 구매할 수 있습니다.</li>
                            <li>결제와 관련된 보안 책임은 이용자에게 있으며, 이용자의 부주의로 인한 결제 정보 노출에 대해 회사는 책임을 지지 않습니다.</li>
                            <li>회사는 정책 및 결제 업체의 기준에 따라 결제 수단별 결제 한도를 부여할 수 있습니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4 text-accent-gold">제8조 (청약 철회 및 환불)</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>전자상거래법 제17조 제2항에 따라, **디지털 콘텐츠의 분석이 시작되었거나 결과가 생성된 경우**에는 다시 판매하기 곤란한 가치가 있는 것으로 보아 청약 철회가 제한됩니다.</li>
                            <li>이용자는 구매 후 콘텐츠를 열람하지 않은 상태에서 7일 이내에 청약 철회를 요청할 수 있습니다.</li>
                            <li>회사의 귀책 사유로 서비스를 정상적으로 이용하지 못한 경우 회사는 결제 금액을 전액 환불합니다.</li>
                            <li>무료로 지급받은 포인트, 쿠폰, 이벤트 당첨 상품 등은 환불 대상에서 제외됩니다.</li>
                            <li>환불은 이용자가 결제한 수단과 동일한 방법으로 처리함을 원칙으로 합니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4">제9조 (이용자의 의무 및 제한)</h2>
                        <p>이용자는 다음 행위를 하여서는 안 됩니다:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>회사의 저작권 및 제3자의 지적재산권 침해</li>
                            <li>분석 결과를 무단으로 복제, 배포, 판매하는 행위</li>
                            <li>타인의 결제 정보를 도용하는 행위</li>
                            <li>회사의 서비스 운영에 지장을 주는 해킹 또는 매크로 사용</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4 text-accent-gold">제10조 (면책 조항)</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>회사는 천재지변, 전시, 사변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제되니다.</li>
                            <li>**본 서비스의 분석 결과는 AI 알고리즘에 기초한 통계적 해석일 뿐이며, 이용자의 실제 운기나 미래를 보장하지 않습니다.** 이용자는 결과를 참고용으로만 활용해야 하며, 이를 근거로 내린 중대한 결정에 대한 법적 책임은 이용자 본인에게 있습니다.</li>
                            <li>회사는 이용자의 단말기 환경이나 네트워크 문제로 발생한 이용 장애에 대해 책임을 지지 않습니다.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4">제11조 (카카오톡 알림톡 및 메시지 발송)</h2>
                        <p>회사는 서비스 이용 과정(결제 확인, 리포트 도착 등)에서 발생하는 주요 정보를 카카오톡 알림톡 또는 SMS로 발송할 수 있습니다. 데이터 요금이 발생할 수 있으며, 수신을 원치 않으실 경우 알림톡 하단의 차단을 통해 수신 거부가 가능합니다.</p>
                    </section>

                    <section>
                        <h2 className="text-xl text-white font-cinzel mb-4">제12조 (준거법 및 재판권)</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>회사와 이용자 간에 발생한 분쟁은 대한민국 법을 준거법으로 합니다.</li>
                            <li>서비스 이용과 관련된 소송은 민사소송법상 관할 법원을 제1심 법원으로 합니다.</li>
                        </ol>
                    </section>

                    <section className="pt-10 border-t border-white/10 opacity-50">
                        <p>공고일자: 2025년 1월 1일</p>
                        <p>시행일자: 2025년 1월 1일</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
