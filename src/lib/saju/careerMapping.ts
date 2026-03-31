export interface CareerResult {
  jobId: string;
  title: string;
  description: string;
  traits: string[];
  shareText: string;
}

export const CAREER_RESULTS: Record<string, CareerResult> = {
  wood_fire_01: {
    jobId: "wood_fire_01",
    title: "사무실의 의적, 월급루팡",
    description: "목(木)과 화(火)의 팽창하는 기운이 강해 가만히 있으면 병이 납니다. 영혼 없는 엑셀 작업보다 티 안나게 딴짓하는 데 천부적인 소질을 가졌습니다. 차라리 발로 뛰는 영업이나 자유로운 프리랜서가 어울립니다.",
    traits: ["상사 눈 피하기 달인", "충동적인 퇴사병", "프로 출근러"],
    shareText: "사주로 본 내 진짜 직장 생존 타입은 '사무실의 의적, 월급루팡' ㅋㅋㅋ 나랑 찰떡임 👇\n"
  },
  water_metal_02: {
    jobId: "water_metal_02",
    title: "팩폭 장인, 빙의러",
    description: "금(金)과 수(水)의 차갑고 예리한 기운. 감정보다는 논리가 먼저입니다. 뻘소리하는 동료를 보면 겉으론 웃고 속으론 엑셀로 암살 계획을 세웁니다. 재무, 데이터 분석, 법무 쪽에 등판하면 생태계 교란종이 됩니다.",
    traits: ["엑셀로 암살", "공감지능 0 (선택적)", "효율성 집착"],
    shareText: "사주로 본 내 진짜 직장 타입은 '팩폭 장인 빙의러'라는데? 너희들도 조심해라 🔪👇\n"
  },
  earth_wood_03: {
    jobId: "earth_wood_03",
    title: "부처 멘탈, 탕비실의 지배자",
    description: "토(土)의 기운이 강해 웬만한 개소리도 허허 웃으며 넘기는 인내의 아이콘. 하지만 스트레스를 탕비실 다과 사냥으로 풉니다. 팀의 기둥 역할을 하지만 정작 본인 멘탈은 간당간당하네요. 중간관리자나 HR 계열에서 살아남을 관상입니다.",
    traits: ["카페인 수혈 필수", "보살 코스프레", "탕비실 털이범"],
    shareText: "내 직장 타입 '부처 멘탈, 탕비실 지배자' 나옴 ㅋㅋㅋ 간식 내놔 👇\n"
  },
  metal_fire_04: {
    jobId: "metal_fire_04",
    title: "분노조절장애, 전투형 실무자",
    description: "화(火)가 금(金)을 녹이는 형국. 불같은 성격에 일 처리는 화끈합니다. 하지만 무능한 상사를 보면 참지 못하고 들이받는 '전투 민족'. 스타트업 창업가나 기획자, 해결사가 제격이며, 꽉 막힌 조직에선 시한폭탄입니다.",
    traits: ["할 말 다 하는 스타일", "화끈한 업무처리", "퇴사율 1위 유망주"],
    shareText: "내 직장 타입 '분노조절장애 전투형 실무자' ㅋㅋㅋ 건들지 마라 👇\n"
  },
  water_wood_05: {
    jobId: "water_wood_05",
    title: "유체이탈, 영혼 없는 은둔고수",
    description: "수(水)와 목(木)의 조화. 물처럼 흘러가는 적응력을 가졌으나 사실 속으론 딴 생각을 합니다. 퇴근 시간만 되면 시야에서 사라지는 스텔스 모드의 달인. 모니터와 묵묵히 대화하는 전문직업에 최적화되었습니다.",
    traits: ["조용한 안광", "퇴근 칼각 제비", "메신저 읽씹 장인"],
    shareText: "내 직장 타입 '영혼 없는 은둔고수' ㅋㅋㅋ 퇴근만 기다린다 👇\n"
  },
  earth_metal_06: {
    jobId: "earth_metal_06",
    title: "완벽주의자, 마이크로매니저",
    description: "토(土)와 금(金)이 만나 결벽에 가까운 꼼꼼함을 자랑합니다. 줄 맞춤 하나 폰트 하나까지 신경 쓰다가 퇴근을 못 합니다. 회계, 감리, 기획조정실에서 타인의 숨통을 조이며 본인 만족을 얻는데 탁월한 재능이 있습니다.",
    traits: ["오타 절대 안 넘김", "숨막히는 디테일", "자가발전 번아웃"],
    shareText: "내 직장 타입 '숨 막히는 완벽주의자' 나옴. 어쩐지 피곤하더라 👇\n"
  }
};

const JOB_IDS = Object.keys(CAREER_RESULTS);

/**
 * 생년월일과 시간을 기반으로 난수(결정론적)를 생성해 결과를 매핑합니다.
 */
export function getCareerResult(birthDate: string, birthTime?: string, gender?: string): CareerResult {
  const seedString = `${birthDate}-${birthTime || '00:00'}-${gender || 'all'}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % JOB_IDS.length;
  const targetJobId = JOB_IDS[index];
  
  return CAREER_RESULTS[targetJobId];
}
