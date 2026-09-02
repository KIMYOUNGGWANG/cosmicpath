import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateMasterDossierHtml, type DossierUserData } from '@/lib/pdf/master-dossier-html';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const readingId = searchParams.get('readingId');
        const format = searchParams.get('format') || 'html'; // 'html' or 'pdf'

        let dossierData: DossierUserData = {
            name: 'Client Analysis',
            birthDate: '1995-05-15',
            birthTime: '14:30',
            cityName: 'Seoul',
            sunSign: 'Taurus',
            moonSign: 'Scorpio',
            ascendant: 'Virgo',
            dayMaster: '갑목(甲木)',
            dominantElement: 'Wood 35%',
            verdict: '이번 달은 미뤄왔던 파트너십 조건을 재조정하고 계약의 경계선을 명확히 확정하기에 최적의 시점입니다.',
            decisionLabel: 'MOVE NOW',
            timingBoundary: '향후 72시간 이내',
            copyReadyMessage: '이 부분에 대해 지난주에 고민을 정리해보았는데, 지금 방향대로 이번 주 내에 매듭짓는 것이 서로에게 가장 깔끔할 것 같습니다. 의견 주시면 감사하겠습니다.',
            keyRiskFactors: [
                '감정적 설명 과다: 협상 우위를 지키기 위해 메시지는 3문장 이내로 절제하십시오.',
                '성급한 자금 집행: 지분 또는 계약 조항이 100% 확정되기 전까지 선입금을 유예하십시오.',
                '상대방 반응 지연 시 불안감: 상대의 즉각적인 응답을 기대하지 말고 48시간의 시한을 두십시오.'
            ],
            easternInsight: '2026년 丙午(병오) 세운은 화(Fire) 기운의 절정기입니다. 당신의 일주와 조후 균형을 검토할 때, 상반기는 시스템적 자산화와 계약 정리에 가장 유리한 국면입니다.',
            westernInsight: 'Pluto transit in Aquarius activates your 10th/11th house axis. Inner psychological resistance stems from fear of autonomy loss. Channeling your natal Saturn discipline provides immediate stabilization.',
        };

        if (readingId) {
            const record = await prisma.readingResult.findUnique({
                where: { id: readingId },
                select: {
                    id: true,
                    data: true,
                    metadata: true,
                }
            });

            if (record) {
                try {
                    const parsedData = typeof record.data === 'string' ? JSON.parse(record.data) : record.data;
                    const parsedMeta = record.metadata ? (typeof record.metadata === 'string' ? JSON.parse(record.metadata) : record.metadata) : null;
                    
                    const readingData = parsedData?.readingData || parsedData;
                    const reportData = parsedData?.reportData || parsedData;
                    const summary = reportData?.summary;

                    if (readingData?.name) dossierData.name = readingData.name;
                    if (readingData?.birthDate) dossierData.birthDate = readingData.birthDate;
                    if (readingData?.birthTime) dossierData.birthTime = readingData.birthTime;
                    if (readingData?.cityName) dossierData.cityName = readingData.cityName;

                    if (summary?.content || summary?.title) {
                        dossierData.verdict = summary.content || summary.title || dossierData.verdict;
                    }

                    if (parsedMeta?.saju?.dayMaster) dossierData.dayMaster = parsedMeta.saju.dayMaster;
                    if (parsedMeta?.astrology?.sunSign) dossierData.sunSign = parsedMeta.astrology.sunSign;
                    if (parsedMeta?.astrology?.moonSign) dossierData.moonSign = parsedMeta.astrology.moonSign;
                    if (parsedMeta?.astrology?.ascendant) dossierData.ascendant = parsedMeta.astrology.ascendant;
                } catch (e) {
                    console.error('[PDF Route] Error parsing readingResult data:', e);
                }
            }
        }

        const html = generateMasterDossierHtml(dossierData);

        return new NextResponse(html, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        console.error('[PDF Route] Error generating dossier:', error);
        return NextResponse.json({ error: 'Failed to generate dossier' }, { status: 500 });
    }
}
