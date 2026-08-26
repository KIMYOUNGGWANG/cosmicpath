/**
 * 사주 신살(神煞) & 흉살의 프로페셔널 승화(Transformation of Shadows) 엔진
 * 
 * 백호대살, 양인살, 괴강살, 도화살, 현침살, 역마살 등 강한 에너지를 가진 살을
 * 단순 흉이 아닌 "초일류 전문가/CEO/창업가의 핵심 무기"로 승화시키는 전환 공식을 산출합니다.
 */

import type { SajuResult } from './saju';

export interface ShadowTransformationItem {
  id: string;
  salNameKo: string;
  salNameHanja: string;
  salNameEn: string;
  category: 'POWER' | 'INSIGHT' | 'INFLUENCE' | 'EXPANSION' | 'PRECISION';
  isDetected: boolean;
  shadowPattern: {
    ko: string;
    en: string;
  };
  transformedSuperpower: {
    titleKo: string;
    titleEn: string;
    descKo: string;
    descEn: string;
  };
  recommendedArchetypes: string[];
  actionStrategy: {
    ko: string;
    en: string;
  };
}

export interface ShadowTransformationResult {
  detectedCount: number;
  primarySuperpower: string;
  transformations: ShadowTransformationItem[];
  overallSynthesisKo: string;
  overallSynthesisEn: string;
}

const SHADOW_DEFINITIONS: Record<string, Omit<ShadowTransformationItem, 'isDetected'>> = {
  baekho: {
    id: 'baekho',
    salNameKo: '백호대살',
    salNameHanja: '白虎大煞',
    salNameEn: 'White Tiger Blade',
    category: 'POWER',
    shadowPattern: {
      ko: '돌발적인 사건 사고, 억누를 수 없는 분노와 극단적 감정 폭발, 피를 보는 물리적 충돌 리스크.',
      en: 'Sudden unexpected crises, explosive extreme emotions, and physical clash risks.',
    },
    transformedSuperpower: {
      titleKo: '위기 돌파 & 초정밀 집도력 (Crisis Surgeon)',
      titleEn: 'Crisis Breakthrough & Surgical Execution',
      descKo: '위기 상황에서 남들이 얼어붙을 때 가장 차갑고 단호하게 메스를 대는 압도적인 문제 해결 능력.',
      descEn: 'The ability to make decisive, surgical interventions when others freeze under extreme crisis.',
    },
    recommendedArchetypes: ['외과의사/의료계', '검사/판사/특수수사', '위기관리 CEO', '딥테크 창업가', '리스크 헤지 펀드매니저'],
    actionStrategy: {
      ko: '위험을 회피하려 하지 마십시오. 당신의 날카로운 결단력이 필요한 고난도 프로젝트나 위기 해결의 총괄을 맡을 때 100억대 무기가 됩니다.',
      en: 'Do not evade high stakes. Your sharpness becomes an invaluable weapon when taking charge of crisis resolution and complex executive decisions.',
    },
  },
  yangin: {
    id: 'yangin',
    salNameKo: '양인살',
    salNameHanja: '羊刃煞',
    salNameEn: 'Blade of Authority',
    category: 'POWER',
    shadowPattern: {
      ko: '타협 없는 독선과 지배욕, 조직 내 불화와 급진적 손실, 적을 만드는 강한 언행.',
      en: 'Uncompromising authoritarianism, workplace friction, and radical losses from over-aggression.',
    },
    transformedSuperpower: {
      titleKo: '카리스마적 권능 & 결단 집행력 (Executive Command)',
      titleEn: 'Charismatic Authority & High-Stakes Execution',
      descKo: '복잡한 이해관계를 한 칼에 정리하고 대규모 조직을 결집시켜 전진시키는 총사령관의 권한.',
      descEn: 'The supreme command authority to align complex stakeholders and drive large-scale organizations forward.',
    },
    recommendedArchetypes: ['대기업 총괄 C-Level', 'M&A 구조조정 전문가', '정치/공공 리더', '스타트업 스케일업 파운더'],
    actionStrategy: {
      ko: '사소한 일로 아랫사람과 기싸움하지 마십시오. 판을 키워 큰 조직의 시스템을 구축하고 방향을 지휘하는 데 에너지를 전액 투자하십시오.',
      en: 'Do not waste energy on petty personal micromanagement. Channel your authority entirely into setting high-level systems and commanding vision.',
    },
  },
  goegang: {
    id: 'goegang',
    salNameKo: '괴강살',
    salNameHanja: '魁罡煞',
    salNameEn: 'Chief of Constellations',
    category: 'INFLUENCE',
    shadowPattern: {
      ko: '주변의 극단적 호불호, 고독과 외로움, 타인에게 인정받지 못할 때 오는 고립감.',
      en: 'Extreme polarization in relationships, deep isolation, and frustration when unrecognized.',
    },
    transformedSuperpower: {
      titleKo: '씬을 지배하는 독보적 프레임 메이커 (Standard Setter)',
      titleEn: 'Dominant Category-Defining Frame Maker',
      descKo: '남의 기준을 따르지 않고 새로운 룰과 문화를 창조하여 대중을 따르게 만드는 압도적 카리스마.',
      descEn: 'The magnetic presence to establish entirely new industry standards and lead movements.',
    },
    recommendedArchetypes: ['독보적 브랜드 파운더', '사상가/베스트셀러 작가', '특허/원천기술 개발자', '컬트 브랜드 디렉터'],
    actionStrategy: {
      ko: '대중의 평균적 취향에 영합하려 하지 마십시오. 당신만의 독보적인 기준과 철학을 1mm도 양보 없이 밀고 나갈 때 시장이 당신을 따릅니다.',
      en: 'Never dilute yourself to fit generic consensus. When you stand uncompromisingly on your unique principles, the market conforms to you.',
    },
  },
  dohwa: {
    id: 'dohwa',
    salNameKo: '도화살',
    salNameHanja: '桃花煞',
    salNameEn: 'Peach Blossom Magnetism',
    category: 'INFLUENCE',
    shadowPattern: {
      ko: '구설수, 불필요한 이성 치정 갈등, 겉치레와 감정적 에너지 소모.',
      en: 'Gossip, messy romantic entanglements, and emotional drain from excessive social vanity.',
    },
    transformedSuperpower: {
      titleKo: '대중 흡인력 & 퍼스널 브랜딩 파워 (Hyper Magnetism)',
      titleEn: 'Mass Captivation & Personal Brand Engine',
      descKo: '말 한마디와 존재감만으로 대중의 시선을 사로잡고 신뢰와 팬덤을 결집시키는 바이럴 파워.',
      descEn: 'The viral magnetism to capture collective attention and convert audience engagement into loyal capital.',
    },
    recommendedArchetypes: ['미디어/콘텐츠 크리에이터', '탑 세일즈 마스터', '브랜드 앰버서더', 'IR/피칭 전문 파트너'],
    actionStrategy: {
      ko: '사적인 감정 놀음에 에너지를 낭비하지 마십시오. 도화의 매력을 대외 퍼스널 브랜딩과 미디어 확산, 고객 유치 엔진으로 치환하십시오.',
      en: 'Stop dissipating your magnetism on personal relationship noise. Channel it strictly into high-visibility branding and customer conversion.',
    },
  },
  hyeonchim: {
    id: 'hyeonchim',
    salNameKo: '현침살',
    salNameHanja: '懸針煞',
    salNameEn: 'Sharp Needle Insight',
    category: 'PRECISION',
    shadowPattern: {
      ko: '날카로운 독설로 타인에게 상처를 줌, 지나친 결벽과 비판적 시각으로 인한 피로.',
      en: 'Sharp, wounding speech, hypercritical perfectionism, and relational exhaustion.',
    },
    transformedSuperpower: {
      titleKo: '촌철살인의 코드 & 정밀 데이터 아키텍처 (Precision Architect)',
      titleEn: 'Piercing Analytical Precision & Code Architecture',
      descKo: '1픽셀의 오류, 0.01%의 데이터 버그도 놓치지 않는 극초정밀 검증과 설계 감각.',
      descEn: 'Flawless precision to detect micro-errors and architect bulletproof analytical systems.',
    },
    recommendedArchetypes: ['소프트웨어 아키텍트/엔지니어', '보안/포렌식 전문가', '정밀 감사관', '전략 기획 및 QA 총괄'],
    actionStrategy: {
      ko: '사람의 인격을 지적하지 말고, 시스템의 취약점을 개선하는 데 날카로움을 사용하십시오. 최고의 아키텍처가 탄생합니다.',
      en: 'Direct your piercing critical eye at system architectures and security vulnerabilities rather than personal criticisms.',
    },
  },
  yeokma: {
    id: 'yeokma',
    salNameKo: '역마살',
    salNameHanja: '驛馬煞',
    salNameEn: 'Global Steed Mobility',
    category: 'EXPANSION',
    shadowPattern: {
      ko: '한곳에 정착하지 못하는 산만함, 잦은 이직과 방황, 만성적인 피로와 낭비.',
      en: 'Restlessness, inability to settle, frequent aimless wandering, and chronic travel fatigue.',
    },
    transformedSuperpower: {
      titleKo: '글로벌 무대 확장력 & 국경 없는 개척력 (Cross-Border Expansion)',
      titleEn: 'Cross-Border Expansion & Rapid Scalability',
      descKo: '새로운 지역, 신시장, 글로벌 환경에 즉각 적응하여 영토를 넓히는 기동력.',
      descEn: 'The agility to penetrate foreign markets and scale operations across physical and digital boundaries.',
    },
    recommendedArchetypes: ['크로스보더 무역/이커머스', '글로벌 비즈니스 디벨로퍼', '원격 분산 조직 리더', '해외 특파원/탐험가'],
    actionStrategy: {
      ko: '한자리에서 버티는 루틴 업무에 갇히지 마십시오. 디지털 노마드, 해외 지사 개척, 온·오프라인 크로스 채널 확장에 투입되십시오.',
      en: 'Avoid static repetitive routines. Position yourself in global distribution, overseas expansion, and agile digital mobility.',
    },
  },
};

/**
 * 사주 원국에서 신살을 감지하고 프로페셔널 승화 해법을 도출합니다.
 */
export function calculateShadowTransformations(saju: SajuResult): ShadowTransformationResult {
  const shinSal = saju.shinSal;
  const allShinSalNames = [
    ...(shinSal?.positive?.map(s => s.name) || []),
    ...(shinSal?.negative?.map(s => s.name) || []),
    ...(shinSal?.neutral?.map(s => s.name) || []),
  ];

  // 4주 간지 수집
  const pillars = [saju.yeonPillar, saju.monthPillar, saju.dayPillar, saju.hourPillar].filter(Boolean);
  const allStems = pillars.map(p => p.stem);
  const allBranches = pillars.map(p => p.branch);
  const dayPillarStr = `${saju.dayPillar.stem}${saju.dayPillar.branch}`;

  const transformations: ShadowTransformationItem[] = [];

  // 1. 백호대살 체크 (갑진, 을미, 병술, 정축, 무진, 임술, 계축)
  const isBaekho = allShinSalNames.some(s => s.includes('백호')) ||
    ['갑진', '을미', '병술', '정축', '무진', '임술', '계축'].some(p => dayPillarStr === p);
  transformations.push({ ...SHADOW_DEFINITIONS.baekho, isDetected: isBaekho });

  // 2. 양인살 체크 (갑묘, 병오, 무오, 경유, 임자 등)
  const isYangin = allShinSalNames.some(s => s.includes('양인')) ||
    ['갑묘', '병오', '무오', '경유', '임자'].some(p => dayPillarStr === p);
  transformations.push({ ...SHADOW_DEFINITIONS.yangin, isDetected: isYangin });

  // 3. 괴강살 체크 (무진, 무술, 경진, 경술, 임진, 임술)
  const isGoegang = allShinSalNames.some(s => s.includes('괴강')) ||
    ['무진', '무술', '경진', '경술', '임진', '임술'].some(p => dayPillarStr === p);
  transformations.push({ ...SHADOW_DEFINITIONS.goegang, isDetected: isGoegang });

  // 4. 도화살 체크 (자, 오, 묘, 유 지지 보유)
  const isDohwa = allShinSalNames.some(s => s.includes('도화')) ||
    allBranches.some(b => ['자', '오', '묘', '유'].includes(b));
  transformations.push({ ...SHADOW_DEFINITIONS.dohwa, isDetected: isDohwa });

  // 5. 현침살 체크 (갑, 신, 묘, 오, 신 글자 보유)
  const isHyeonchim = allShinSalNames.some(s => s.includes('현침')) ||
    allStems.some(s => ['갑', '신'].includes(s)) ||
    allBranches.some(b => ['묘', '오', '신'].includes(b));
  transformations.push({ ...SHADOW_DEFINITIONS.hyeonchim, isDetected: isHyeonchim });

  // 6. 역마살 체크 (인, 신, 사, 해 지지 보유)
  const isYeokma = allShinSalNames.some(s => s.includes('역마')) ||
    allBranches.some(b => ['인', '신', '사', '해'].includes(b));
  transformations.push({ ...SHADOW_DEFINITIONS.yeokma, isDetected: isYeokma });

  const detectedItems = transformations.filter(t => t.isDetected);
  const detectedCount = detectedItems.length;

  const primarySuperpower = detectedItems[0]?.transformedSuperpower.titleKo || '정밀 균형 & 전략적 실행력';

  const overallSynthesisKo = detectedCount > 0
    ? `당신의 사주 원국에 내재된 ${detectedItems.map(d => d.salNameKo).join(', ')}의 강력한 기운은 일상적 마찰이 아닌 프로페셔널 무기(${primarySuperpower})로 승화시킬 때 폭발적인 성과를 만들어냅니다.`
    : '원국이 온화하고 극단적 흉살이 적어 안정적인 지속 성장과 조직 내 신뢰 구축에 최적화된 기운을 가졌습니다.';

  const overallSynthesisEn = detectedCount > 0
    ? `The latent energies of ${detectedItems.map(d => d.salNameEn).join(', ')} in your chart are transformed from relational friction into high-impact executive superpowers.`
    : 'Your chart is balanced and harmonious, optimized for consistent compounding growth and strategic trust.';

  return {
    detectedCount,
    primarySuperpower,
    transformations,
    overallSynthesisKo,
    overallSynthesisEn,
  };
}
