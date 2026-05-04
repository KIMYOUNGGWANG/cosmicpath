import {
  FIVE_ELEMENTS,
  HEAVENLY_STEMS_DATA,
  HIDDEN_STEMS,
  type DaeunPillar,
  type HiddenStem,
  type SajuResult,
  calculateSaju,
  formatSaju,
} from '@/lib/engines/saju';
import { calculateTrueSolarTime, type TrueSolarTimeResult } from './true-solar-time';
import { calculateNatal } from './natal';
import { createChart, getDaxianList } from './ziwei';

export type Gender = 'male' | 'female' | 'M' | 'F';
export type YinYang = 'yin' | 'yang';
export type Element = keyof typeof FIVE_ELEMENTS;

export interface PillarDetail {
  stem: string;
  branch: string;
  fullStem: string;
  fullBranch: string;
  ganzi: string;
  stemElement: Element;
  branchElement: Element;
  stemYinYang: YinYang;
}

export interface OracleRawPillar {
  pillar: PillarDetail;
  stemSipsin: string;
  branchSipsin: string;
  unseong: string;
  spirit: string;
  hiddenStems: string[];
  jigang: string;
}

export interface OracleRawProfile {
  input: {
    birthDate: string;
    birthTime: string;
    gender: Gender;
    isLunar?: boolean;
    cityName?: string;
    unknownTime?: boolean;
  };
  pillars: OracleRawPillar[];
  ohang: Record<Element, number>;
  daeun: DaeunPillar[];
}

export interface PrecisionMetadata {
  inputDate: string;
  inputTime: string;
  tstOffset: number;
  correctedDate: string;
  correctedTime: string;
  lon: number;
  hourPillar: string;
}

export interface OracleCouncil {
  convergenceScore: number;
  ziweiSummary: string;
  natalSummary: string;
}

export type OracleAdvisorIntent =
  | 'general'
  | 'compatibility'
  | 'reunion'
  | 'wealth'
  | 'timing'
  | 'career'
  | 'business';

export type OracleAdvisorEvidenceSource = 'saju' | 'ziwei' | 'natal' | 'tarot';

export interface OracleSajuProfile {
  raw: OracleRawProfile;
  formattedSaju: string;
  dominantElements: Element[];
  lackingElements: Element[];
  relationHighlights: string[];
  daeunPreview: string[];
  precisionMetadata: PrecisionMetadata;
  oracleCouncil: OracleCouncil;
  location: {
    cityName: string;
    latitude: number;
    longitude: number;
    isDefault: boolean;
  };
  trueSolarTime: TrueSolarTimeResult;
  ziweiChart: ZiweiChart;
  natalChart: NatalChart;
}

export interface ZiweiChart {
  mingGongZhi: string;
  shenGongZhi: string;
  wuXingJu: { name: string; number: number };
  palaces: Record<string, ZiweiPalace>;
}

export interface ZiweiPalace {
  name: string;
  zhi: string;
  ganZhi: string;
  stars: ZiweiStar[];
  isShenGong?: boolean;
}

export interface ZiweiStar {
  name: string;
  brightness: string;
  siHua?: string;
}

export interface LiuNianInfo {
  year: number;
  stem: string;
  branch: string;
  mingGongZhi: string;
  natalPalaceAtMing: string;
  siHua: Record<string, string>;
  daxianPalaceName: string;
  daxianAgeStart: number;
  daxianAgeEnd: number;
}

export interface DaxianItem {
  ageStart: number;
  ageEnd: number;
  palaceName: string;
  ganZhi: string;
  mainStars: string[];
}

export type ZodiacSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer'
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio'
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type PlanetId =
  | 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars'
  | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto';

export interface PlanetPosition {
  id: PlanetId;
  planet: PlanetId;
  sign: ZodiacSign;
  degree: number;
  degreeInSign: number;
  house: number;
  isRetrograde: boolean;
}

export interface NatalHouse {
  house: number;
  sign: ZodiacSign;
  degree: number;
}

export interface NatalAngles {
  asc: { sign: ZodiacSign; degree: number };
  mc: { sign: ZodiacSign; degree: number };
}

export interface NatalAspect {
  planet1: PlanetId;
  planet2: PlanetId;
  type: string;
  angle: number;
  orb: number;
}

export interface NatalChart {
  planets: PlanetPosition[];
  houses: NatalHouse[];
  angles: NatalAngles;
  aspects: NatalAspect[];
}

export const ZODIAC_KO: Record<ZodiacSign, string> = {
  Aries: '양자리',
  Taurus: '황소자리',
  Gemini: '쌍둥이자리',
  Cancer: '게자리',
  Leo: '사자자리',
  Virgo: '처녀자리',
  Libra: '천칭자리',
  Scorpio: '전갈자리',
  Sagittarius: '사수자리',
  Capricorn: '염소자리',
  Aquarius: '물병자리',
  Pisces: '물고기자리',
};

const PALACE_TONE: Record<string, string> = {
  명궁: '자기 방향과 정체성을 또렷하게 붙드는 흐름',
  관록궁: '일과 역할에서 존재감이 커지는 흐름',
  재백궁: '돈과 자원 관리 감각이 예민해지는 흐름',
  복덕궁: '내면 회복과 정신적 정리가 중요한 흐름',
  부처궁: '관계의 균형과 대화가 성패를 가르는 흐름',
};

const NATAL_SIGN_TONE: Record<ZodiacSign, string> = {
  Aries: '선제적으로 움직이며 판을 여는 타입',
  Taurus: '안정과 지속성을 쌓는 타입',
  Gemini: '정보와 연결을 빠르게 엮는 타입',
  Cancer: '감정적 안전과 보호 본능이 강한 타입',
  Leo: '존재감과 표현력으로 무게를 만드는 타입',
  Virgo: '정리와 정밀함으로 신뢰를 쌓는 타입',
  Libra: '균형 감각과 조율력이 빛나는 타입',
  Scorpio: '집중력과 통찰로 깊게 파고드는 타입',
  Sagittarius: '확장과 탐색으로 돌파구를 찾는 타입',
  Capricorn: '현실 감각과 책임감으로 구조를 세우는 타입',
  Aquarius: '독창성과 거리감으로 새 판을 여는 타입',
  Pisces: '직관과 공감으로 흐름을 읽는 타입',
};

function normalizeGender(gender: Gender): 'male' | 'female' {
  return gender === 'female' || gender === 'F' ? 'female' : 'male';
}

function getStemMeta(stem: string) {
  return HEAVENLY_STEMS_DATA.find((item) => item.hangul === stem);
}

function mapHiddenStem(hiddenStem?: HiddenStem): string[] {
  if (!hiddenStem) return [];
  return [hiddenStem.yeogi, hiddenStem.junggi, hiddenStem.jeonggi].filter(
    (value): value is string => Boolean(value)
  );
}

function getSpiritSummary(saju: SajuResult, pillarKey: 'year' | 'month' | 'day' | 'hour'): string {
  const branchMap = {
    year: saju.yeonPillar.branch,
    month: saju.monthPillar.branch,
    day: saju.dayPillar.branch,
    hour: saju.hourPillar.branch,
  };
  const spirits = [
    ...(saju.shinSal?.positive ?? []),
    ...(saju.shinSal?.negative ?? []),
    ...(saju.shinSal?.neutral ?? []),
  ];
  const matched = spirits.filter((item) => item.branch === branchMap[pillarKey]);
  return matched.map((item) => item.name).join(', ');
}

function buildRawPillar(
  saju: SajuResult,
  key: 'year' | 'month' | 'day' | 'hour'
): OracleRawPillar {
  const pillarMap = {
    year: saju.yeonPillar,
    month: saju.monthPillar,
    day: saju.dayPillar,
    hour: saju.hourPillar,
  };
  const tenGodKeyMap = {
    year: ['yeonStem', 'yeonBranch'],
    month: ['monthStem', 'monthBranch'],
    day: ['dayStem', 'dayBranch'],
    hour: ['hourStem', 'hourBranch'],
  } as const;
  const stageMap = saju.twelveStages || {
    year: '쇠',
    month: '쇠',
    day: '쇠',
    hour: '쇠',
  };
  const hiddenStemMap = saju.hiddenStems || {
    year: HIDDEN_STEMS[saju.yeonPillar.branch],
    month: HIDDEN_STEMS[saju.monthPillar.branch],
    day: HIDDEN_STEMS[saju.dayPillar.branch],
    hour: HIDDEN_STEMS[saju.hourPillar.branch],
  };

  const target = pillarMap[key];
  const stemMeta = getStemMeta(target.stem);
  const hiddenStems = mapHiddenStem(hiddenStemMap[key]);
  const [stemKey, branchKey] = tenGodKeyMap[key];

  return {
    pillar: {
      stem: stemMeta?.hanja ?? target.stem,
      branch: target.branch,
      fullStem: target.stem,
      fullBranch: target.branch,
      ganzi: `${target.stem}${target.branch}`,
      stemElement: stemMeta?.element ?? 'earth',
      branchElement: saju.elements[key === 'year' ? 0 : key === 'month' ? 1 : key === 'day' ? 2 : 3]?.branch ?? 'earth',
      stemYinYang: stemMeta?.yinYang === '양' ? 'yang' : 'yin',
    },
    stemSipsin: saju.tenGods[stemKey] ?? (key === 'day' ? '일간(나)' : '비견'),
    branchSipsin: saju.tenGods[branchKey] ?? '비견',
    unseong: stageMap[key],
    spirit: getSpiritSummary(saju, key),
    hiddenStems,
    jigang: hiddenStems.join(', '),
  };
}

function buildOhangSummary(saju: SajuResult): Record<Element, number> {
  const distribution: Record<Element, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  for (const element of saju.elements) {
    distribution[element.stem] += 1;
    distribution[element.branch] += 1;
  }

  return distribution;
}

function getElementLeaders(ohang: Record<Element, number>, mode: 'max' | 'min'): Element[] {
  const values = Object.values(ohang);
  const target = mode === 'max' ? Math.max(...values) : Math.min(...values);
  return (Object.entries(ohang) as Array<[Element, number]>)
    .filter(([, value]) => value === target)
    .map(([element]) => element);
}

function formatElementList(elements: Element[]): string {
  return elements.map((element) => FIVE_ELEMENTS[element]).join(', ');
}

function buildRelationHighlights(saju: SajuResult): string[] {
  const highlights: string[] = [];

  if (saju.gyeokguk?.type) {
    highlights.push(`격국은 ${saju.gyeokguk.type} 흐름이 중심입니다.`);
  }
  if (saju.enhancedYongsin?.reasoning) {
    highlights.push(`용신 판단: ${saju.enhancedYongsin.reasoning}`);
  }
  if (saju.interactions?.clashes.length) {
    highlights.push(`지지 충: ${saju.interactions.clashes.map((item) => item.type).join(', ')}`);
  }
  const shinSalItems = [
    ...(saju.shinSal?.positive ?? []),
    ...(saju.shinSal?.negative ?? []),
    ...(saju.shinSal?.neutral ?? []),
  ];
  if (shinSalItems.length) {
    highlights.push(`신살 포인트: ${shinSalItems.slice(0, 3).map((item) => item.name).join(', ')}`);
  }

  return highlights.slice(0, 4);
}

function buildDaeunPreview(saju: SajuResult): string[] {
  const sequence = saju.daeun?.sequence;
  if (!sequence?.length) return [];

  const currentDaeun = saju.daeun?.currentDaeun;

  // Find the index of the current daeun in the sequence
  const currentIndex = currentDaeun
    ? sequence.findIndex((item) => item.startAge === currentDaeun.startAge)
    : -1;

  // Select window: [prev, current, next] centered on the current daeun
  // If no current daeun found, fall back to first 3
  const startIndex = currentIndex > 0 ? currentIndex - 1 : 0;
  const window = sequence.slice(startIndex, startIndex + 3);

  return window.map((item) => {
    const isCurrent = currentDaeun && item.startAge === currentDaeun.startAge;
    const label = `${item.startAge}-${item.endAge}세 ${item.stem}${item.branch}${item.tenGod ? ` (${item.tenGod})` : ''}`;
    return isCurrent ? `${label} ★현재` : label;
  });
}

function buildZiweiSummary(chart: ZiweiChart): string {
  const mingPalace = chart.palaces['명궁'];
  const mainStars = mingPalace?.stars.map((star) => star.name).join(', ') || '자미';
  const tone = PALACE_TONE[mingPalace?.name ?? '명궁'] ?? '정체성과 방향감이 다시 정렬되는 흐름';
  return `명궁 ${chart.mingGongZhi}, ${chart.wuXingJu.name} 기준으로 ${tone}입니다. 핵심 성요는 ${mainStars}입니다.`;
}

function getPlanet(chart: NatalChart, planetId: PlanetId): PlanetPosition | undefined {
  return chart.planets.find((planet) => planet.planet === planetId);
}

function buildNatalSummary(chart: NatalChart): string {
  const sun = getPlanet(chart, 'Sun');
  const moon = getPlanet(chart, 'Moon');
  const asc = chart.angles.asc;
  const sunTone = NATAL_SIGN_TONE[sun?.sign ?? 'Cancer'];

  return `태양 ${ZODIAC_KO[sun?.sign ?? 'Cancer']}, 달 ${ZODIAC_KO[moon?.sign ?? 'Pisces']}, 상승궁 ${ZODIAC_KO[asc.sign]} 조합입니다. 전반적으로 ${sunTone} 성향이 강합니다.`;
}

function getSignThemes(chart: NatalChart): string[] {
  const sun = getPlanet(chart, 'Sun');
  const moon = getPlanet(chart, 'Moon');
  const asc = chart.angles.asc;
  return [sun?.sign, moon?.sign, asc.sign].filter((value): value is ZodiacSign => Boolean(value));
}

function getSajuThemes(raw: OracleRawProfile): string[] {
  return [
    raw.pillars[1]?.pillar.stemElement,
    raw.pillars[2]?.pillar.branchElement,
    ...getElementLeaders(raw.ohang, 'max'),
  ].filter((value): value is Element => Boolean(value));
}

const INTENT_ZIWEI_PALACES: Record<OracleAdvisorIntent, string[]> = {
  general: ['명궁', '복덕궁'],
  compatibility: ['부처궁', '명궁'],
  reunion: ['부처궁', '복덕궁'],
  wealth: ['재백궁', '복덕궁'],
  timing: ['명궁', '관록궁'],
  career: ['관록궁', '명궁'],
  business: ['관록궁', '재백궁'],
};

function getPillarLabel(index: number): string {
  return ['시주', '일주', '월주', '연주'][index] ?? '주';
}

function buildSajuIntentEvidence(
  profile: OracleSajuProfile,
  questionIntent: OracleAdvisorIntent,
  language: 'ko' | 'en'
): string {
  const dayPillar = profile.raw.pillars[1];
  const monthPillar = profile.raw.pillars[2];
  const yearPillar = profile.raw.pillars[3];
  const elementSummary = language === 'en'
    ? `dominant ${formatElementList(profile.dominantElements)}, lacking ${formatElementList(profile.lackingElements)}`
    : `강점 ${formatElementList(profile.dominantElements)}, 부족 ${formatElementList(profile.lackingElements)}`;
  const daeunLead = profile.daeunPreview.find((item) => item.includes('★현재')) ?? profile.daeunPreview[0];

  switch (questionIntent) {
    case 'compatibility':
      return language === 'en'
        ? `Day pillar ${dayPillar?.pillar.ganzi ?? 'unknown'} and relationship highlights ${profile.relationHighlights.join(' / ') || 'notable chemistry patterns'} suggest the relational rhythm. Element balance points to ${elementSummary}.`
        : `일주 ${dayPillar?.pillar.ganzi ?? '미상'}와 관계 하이라이트 ${profile.relationHighlights.join(' / ') || '관계 리듬 단서'}를 중심으로 궁합의 온도차를 봅니다. 오행은 ${elementSummary}입니다.`;
    case 'reunion':
      return language === 'en'
        ? `Day pillar ${dayPillar?.pillar.ganzi ?? 'unknown'} plus relationship highlights ${profile.relationHighlights.join(' / ') || 'remaining relational residue'} show whether attachment still lingers. ${daeunLead ? `Current cycle: ${daeunLead}.` : ''}`
        : `일주 ${dayPillar?.pillar.ganzi ?? '미상'}와 관계 하이라이트 ${profile.relationHighlights.join(' / ') || '남아 있는 관계 잔향'}로 미련과 재접점 가능성을 봅니다. ${daeunLead ? `현재 대운 단서는 ${daeunLead}입니다.` : ''}`;
    case 'wealth':
      return language === 'en'
        ? `Month pillar ${monthPillar?.stemSipsin ?? 'unknown'} / ${monthPillar?.branchSipsin ?? 'unknown'} and element balance ${elementSummary} indicate how money flow and spending habits behave.`
        : `월주 십신 ${monthPillar?.stemSipsin ?? '미상'} / ${monthPillar?.branchSipsin ?? '미상'}와 오행 ${elementSummary}로 재물 흐름과 지출 습관을 봅니다.`;
    case 'timing':
      return language === 'en'
        ? `${daeunLead ? `Cycle cue: ${daeunLead}.` : 'Current cycle cue is limited.'} True solar time correction is ${profile.precisionMetadata.correctedTime}, so timing is anchored to the corrected chart rather than a rough birth clock.`
        : `${daeunLead ? `대운 단서: ${daeunLead}.` : '현재 대운 단서는 제한적입니다.'} 진태양시 보정 ${profile.precisionMetadata.correctedTime} 기준으로 시기 판단을 고정합니다.`;
    case 'career':
      return language === 'en'
        ? `Month pillar ${monthPillar?.stemSipsin ?? 'unknown'} / ${monthPillar?.branchSipsin ?? 'unknown'} and year pillar ${yearPillar?.stemSipsin ?? 'unknown'} describe role fit, social expectations, and growth pressure.`
        : `월주 ${monthPillar?.stemSipsin ?? '미상'} / ${monthPillar?.branchSipsin ?? '미상'}와 연주 ${yearPillar?.stemSipsin ?? '미상'}를 중심으로 역할 적합도와 성장 압력을 봅니다.`;
    case 'business':
      return language === 'en'
        ? `Month pillar ${monthPillar?.stemSipsin ?? 'unknown'} and year pillar ${yearPillar?.branchSipsin ?? 'unknown'} help read leverage, partner load, and expansion risk. Element balance points to ${elementSummary}.`
        : `월주 ${monthPillar?.stemSipsin ?? '미상'}와 연주 ${yearPillar?.branchSipsin ?? '미상'}를 중심으로 레버리지, 파트너 부담, 확장 리스크를 읽습니다. 오행은 ${elementSummary}입니다.`;
    case 'general':
    default:
      return language === 'en'
        ? `Day pillar ${dayPillar?.pillar.ganzi ?? 'unknown'}, ${elementSummary}, and ${daeunLead ? `current cycle ${daeunLead}` : 'the current cycle'} frame the overall direction.`
        : `일주 ${dayPillar?.pillar.ganzi ?? '미상'}, 오행 ${elementSummary}, ${daeunLead ? `현재 대운 ${daeunLead}` : '현재 흐름'}을 함께 보고 전체 방향을 정리합니다.`;
  }
}

function buildZiweiIntentEvidence(
  profile: OracleSajuProfile,
  questionIntent: OracleAdvisorIntent,
  language: 'ko' | 'en'
): string {
  const palaceNames = INTENT_ZIWEI_PALACES[questionIntent];
  const snippets = palaceNames
    .map((palaceName) => {
      const palace = profile.ziweiChart.palaces[palaceName];
      if (!palace) return null;
      const stars = palace.stars.slice(0, 2).map((star) => star.name).join(', ');
      if (!stars) return null;
      return language === 'en'
        ? `${palaceName}: ${stars}`
        : `${palaceName} ${stars}`;
    })
    .filter((value): value is string => Boolean(value));

  if (snippets.length === 0) {
    return language === 'en'
      ? `Ziwei summary: ${profile.oracleCouncil.ziweiSummary}`
      : `자미 단서: ${profile.oracleCouncil.ziweiSummary}`;
  }

  return language === 'en'
    ? `${snippets.join(' | ')}. Ziwei summary: ${profile.oracleCouncil.ziweiSummary}`
    : `${snippets.join(' | ')}. 자미 요약: ${profile.oracleCouncil.ziweiSummary}`;
}

function buildNatalIntentEvidence(
  profile: OracleSajuProfile,
  questionIntent: OracleAdvisorIntent,
  language: 'ko' | 'en'
): string {
  const sun = getPlanet(profile.natalChart, 'Sun');
  const moon = getPlanet(profile.natalChart, 'Moon');
  const venus = getPlanet(profile.natalChart, 'Venus');
  const mars = getPlanet(profile.natalChart, 'Mars');
  const jupiter = getPlanet(profile.natalChart, 'Jupiter');
  const saturn = getPlanet(profile.natalChart, 'Saturn');
  const mc = profile.natalChart.angles.mc.sign;

  switch (questionIntent) {
    case 'compatibility':
    case 'reunion':
      return language === 'en'
        ? `Venus ${venus?.sign ?? 'unknown'} / House ${venus?.house ?? '?'} and Moon ${moon?.sign ?? 'unknown'} / House ${moon?.house ?? '?'} describe bonding style and emotional repair.`
        : `금성 ${ZODIAC_KO[venus?.sign ?? 'Cancer']} ${venus?.house ?? '?'}하우스와 달 ${ZODIAC_KO[moon?.sign ?? 'Pisces']} ${moon?.house ?? '?'}하우스로 애착 방식과 감정 회복 패턴을 봅니다.`;
    case 'wealth':
      return language === 'en'
        ? `Jupiter ${jupiter?.sign ?? 'unknown'} / House ${jupiter?.house ?? '?'} and Saturn ${saturn?.sign ?? 'unknown'} / House ${saturn?.house ?? '?'} show expansion vs. control around money decisions.`
        : `목성 ${ZODIAC_KO[jupiter?.sign ?? 'Sagittarius']} ${jupiter?.house ?? '?'}하우스와 토성 ${ZODIAC_KO[saturn?.sign ?? 'Capricorn']} ${saturn?.house ?? '?'}하우스로 확장과 통제의 균형을 봅니다.`;
    case 'career':
    case 'business':
      return language === 'en'
        ? `MC ${mc}, Sun ${sun?.sign ?? 'unknown'} / House ${sun?.house ?? '?'} and Saturn ${saturn?.sign ?? 'unknown'} / House ${saturn?.house ?? '?'} point to public role, pressure, and responsibility.`
        : `MC ${ZODIAC_KO[mc]}, 태양 ${ZODIAC_KO[sun?.sign ?? 'Cancer']} ${sun?.house ?? '?'}하우스, 토성 ${ZODIAC_KO[saturn?.sign ?? 'Capricorn']} ${saturn?.house ?? '?'}하우스로 사회적 역할과 책임 압력을 봅니다.`;
    case 'timing':
      return language === 'en'
        ? `Sun ${sun?.sign ?? 'unknown'} / House ${sun?.house ?? '?'} with ${profile.natalChart.aspects.length} major aspects gives the pacing signal rather than a fabricated exact date.`
        : `태양 ${ZODIAC_KO[sun?.sign ?? 'Cancer']} ${sun?.house ?? '?'}하우스와 주요 각도 ${profile.natalChart.aspects.length}개를 통해 시기 감각을 좁힙니다.`;
    case 'general':
    default:
      return language === 'en'
        ? `Sun ${sun?.sign ?? 'unknown'}, Moon ${moon?.sign ?? 'unknown'}, ASC ${profile.natalChart.angles.asc.sign} describe the outer role, inner mood, and baseline stance.`
        : `태양 ${ZODIAC_KO[sun?.sign ?? 'Cancer']}, 달 ${ZODIAC_KO[moon?.sign ?? 'Pisces']}, ASC ${ZODIAC_KO[profile.natalChart.angles.asc.sign]}로 바깥 역할과 내면 기조를 봅니다.`;
  }
}

function buildTarotIntentEvidence(language: 'ko' | 'en'): string {
  return language === 'en'
    ? 'Tarot remains a supporting layer for immediate emotional weather, not the primary domain evidence.'
    : '타로는 즉각적인 감정 날씨를 확인하는 보조 레이어이며, 핵심 도메인 근거를 대신하지 않습니다.';
}

export function buildOracleAdvisorEvidenceSummary(input: {
  profile: OracleSajuProfile;
  questionIntent: OracleAdvisorIntent;
  evidencePriority: OracleAdvisorEvidenceSource[];
  language?: 'ko' | 'en';
}): string {
  const language = input.language ?? 'ko';
  const lines = input.evidencePriority.map((source) => {
    if (source === 'saju') {
      return language === 'en'
        ? `- [Saju] ${buildSajuIntentEvidence(input.profile, input.questionIntent, language)}`
        : `- [사주] ${buildSajuIntentEvidence(input.profile, input.questionIntent, language)}`;
    }

    if (source === 'ziwei') {
      return language === 'en'
        ? `- [Ziwei] ${buildZiweiIntentEvidence(input.profile, input.questionIntent, language)}`
        : `- [자미] ${buildZiweiIntentEvidence(input.profile, input.questionIntent, language)}`;
    }

    if (source === 'natal') {
      return language === 'en'
        ? `- [Natal] ${buildNatalIntentEvidence(input.profile, input.questionIntent, language)}`
        : `- [점성] ${buildNatalIntentEvidence(input.profile, input.questionIntent, language)}`;
    }

    return language === 'en'
      ? `- [Tarot] ${buildTarotIntentEvidence(language)}`
      : `- [타로] ${buildTarotIntentEvidence(language)}`;
  });

  if (language === 'en') {
    return [
      '<ADVISOR_EVIDENCE_SUMMARY>',
      `Intent: ${input.questionIntent}`,
      `Convergence: ${input.profile.oracleCouncil.convergenceScore}/100`,
      `Priority: ${input.evidencePriority.join(' > ')}`,
      ...lines,
      '</ADVISOR_EVIDENCE_SUMMARY>',
    ].join('\n');
  }

  return [
    '<상담가_근거_요약>',
    `질문 의도: ${input.questionIntent}`,
    `삼중 수렴도: ${input.profile.oracleCouncil.convergenceScore}/100`,
    `우선순위: ${input.evidencePriority.join(' > ')}`,
    ...lines,
    '</상담가_근거_요약>',
  ].join('\n');
}

export function getTriOracleSummary(input: {
  raw: OracleRawProfile;
  ziweiChart: ZiweiChart;
  natalChart: NatalChart;
}): OracleCouncil {
  const sajuThemes = new Set(getSajuThemes(input.raw));
  const natalThemes = getSignThemes(input.natalChart);
  const overlap = natalThemes.reduce((count, sign) => {
    const mappedElement = sign === 'Aries' || sign === 'Leo' || sign === 'Sagittarius'
      ? 'fire'
      : sign === 'Taurus' || sign === 'Virgo' || sign === 'Capricorn'
        ? 'earth'
        : sign === 'Gemini' || sign === 'Libra' || sign === 'Aquarius'
          ? 'metal'
          : 'water';
    return count + (sajuThemes.has(mappedElement) ? 1 : 0);
  }, 0);

  const mingStars = input.ziweiChart.palaces['명궁']?.stars.length ?? 0;
  const aspects = input.natalChart.aspects.length;
  const convergenceScore = Math.max(55, Math.min(95, 58 + overlap * 10 + Math.min(12, mingStars * 4) + Math.min(9, aspects)));

  return {
    convergenceScore,
    ziweiSummary: buildZiweiSummary(input.ziweiChart),
    natalSummary: buildNatalSummary(input.natalChart),
  };
}

function createOracleRawProfile(
  saju: SajuResult,
  input: OracleRawProfile['input']
): OracleRawProfile {
  return {
    input,
    pillars: [
      buildRawPillar(saju, 'hour'),
      buildRawPillar(saju, 'day'),
      buildRawPillar(saju, 'month'),
      buildRawPillar(saju, 'year'),
    ],
    ohang: buildOhangSummary(saju),
    daeun: saju.daeun?.sequence ?? [],
  };
}

function parseTimeParts(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(':').map(Number);
  return {
    hour: Number.isFinite(hour) ? hour : 12,
    minute: Number.isFinite(minute) ? minute : 0,
  };
}

export function calculateOracleSajuProfile(options: {
  birthDate: string;
  birthTime?: string;
  gender: Gender;
  cityName?: string;
  longitude?: number;
  latitude?: number;
  isLunar?: boolean;
  unknownTime?: boolean;
}): OracleSajuProfile {
  const trueSolarTime = calculateTrueSolarTime({
    birthDate: options.birthDate,
    birthTime: options.birthTime,
    cityName: options.cityName,
    longitude: options.longitude,
    latitude: options.latitude,
    unknownTime: options.unknownTime,
  });
  const { hour, minute } = parseTimeParts(trueSolarTime.correctedTime);
  const normalizedGender = normalizeGender(options.gender);
  const saju = calculateSaju(
    trueSolarTime.correctedDateTime,
    hour,
    minute,
    options.isLunar ?? false,
    normalizedGender,
    trueSolarTime.location.longitude,
    {
      // `calculateTrueSolarTime` already applied the longitude shift.
      // Prevent a second correction from drifting the chart near boundary hours.
      skipLongitudeCorrection: true,
    }
  );
  const raw = createOracleRawProfile(saju, {
    birthDate: options.birthDate,
    birthTime: options.birthTime ?? '12:00',
    gender: options.gender,
    isLunar: options.isLunar,
    cityName: options.cityName,
    unknownTime: options.unknownTime,
  });
  const dominantElements = getElementLeaders(raw.ohang, 'max');
  const lackingElements = getElementLeaders(raw.ohang, 'min');
  const ziweiChart = createChart(
    trueSolarTime.correctedDateTime.getFullYear(),
    trueSolarTime.correctedDateTime.getMonth() + 1,
    trueSolarTime.correctedDateTime.getDate(),
    hour,
    minute,
    normalizedGender === 'male'
  );
  const natalChart = calculateNatal({
    year: trueSolarTime.correctedDateTime.getFullYear(),
    month: trueSolarTime.correctedDateTime.getMonth() + 1,
    day: trueSolarTime.correctedDateTime.getDate(),
    hour,
    minute,
    gender: options.gender,
    latitude: trueSolarTime.location.latitude,
    longitude: trueSolarTime.location.longitude,
  });

  return {
    raw,
    formattedSaju: formatSaju(saju),
    dominantElements,
    lackingElements,
    relationHighlights: buildRelationHighlights(saju),
    daeunPreview: buildDaeunPreview(saju),
    precisionMetadata: {
      inputDate: options.birthDate,
      inputTime: options.birthTime ?? '12:00',
      tstOffset: trueSolarTime.offsetMinutes,
      correctedDate: trueSolarTime.correctedDate,
      correctedTime: trueSolarTime.correctedTime,
      lon: trueSolarTime.location.longitude,
      hourPillar: `${saju.hourPillar.stem}${saju.hourPillar.branch}`,
    },
    oracleCouncil: getTriOracleSummary({ raw, ziweiChart, natalChart }),
    location: trueSolarTime.location,
    trueSolarTime,
    ziweiChart,
    natalChart,
  };
}

export function buildOracleSajuPromptBlock(profile: OracleSajuProfile): string {
  const daxian = getDaxianList(profile.ziweiChart).slice(0, 2);
  const pillars = profile.raw.pillars
    .map((item, index) => {
      const labels = ['시주', '일주', '월주', '연주'];
      return `- ${labels[index]}: ${item.pillar.ganzi} | 십신 ${item.stemSipsin}/${item.branchSipsin} | 12운성 ${item.unseong}`;
    })
    .join('\n');
  const natalSun = getPlanet(profile.natalChart, 'Sun');
  const natalMoon = getPlanet(profile.natalChart, 'Moon');

  return [
    '<ORACLE_PRECISION_PROFILE>',
    `[진태양시] ${profile.precisionMetadata.tstOffset >= 0 ? '+' : ''}${profile.precisionMetadata.tstOffset}분 보정 -> ${profile.precisionMetadata.correctedTime} (경도 ${profile.precisionMetadata.lon})`,
    `[위치] ${profile.location.cityName} / 위도 ${profile.location.latitude.toFixed(4)} / 경도 ${profile.location.longitude.toFixed(4)}`,
    `[사주 원국]`,
    pillars,
    `[오행 밸런스] 강점: ${formatElementList(profile.dominantElements)} | 부족: ${formatElementList(profile.lackingElements)}`,
    profile.relationHighlights.length ? `[관계 하이라이트] ${profile.relationHighlights.join(' / ')}` : '',
    profile.daeunPreview.length ? `[대운 프리뷰] ${profile.daeunPreview.join(' | ')}` : '',
    `[자미두수] ${profile.oracleCouncil.ziweiSummary}`,
    daxian.length ? `[자미 대운] ${daxian.map((item) => `${item.ageStart}-${item.ageEnd}세 ${item.palaceName}`).join(' | ')}` : '',
    `[서양 점성술] ${profile.oracleCouncil.natalSummary}`,
    `[점성 핵심] 태양 ${ZODIAC_KO[natalSun?.sign ?? 'Cancer']} / 달 ${ZODIAC_KO[natalMoon?.sign ?? 'Pisces']} / ASC ${ZODIAC_KO[profile.natalChart.angles.asc.sign]}`,
    `[삼중 수렴도] ${profile.oracleCouncil.convergenceScore}/100`,
    '</ORACLE_PRECISION_PROFILE>',
  ].filter(Boolean).join('\n');
}
