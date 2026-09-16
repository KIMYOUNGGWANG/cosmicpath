export interface BirthLocation {
  cityName: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

interface CityRecord {
  aliases: string[];
  latitude: number;
  longitude: number;
}

const CITY_TABLE: Record<string, CityRecord> = {
  seoul: {
    aliases: ['seoul', '서울', '서울시', '서울특별시'],
    latitude: 37.5665,
    longitude: 126.978,
  },
  busan: {
    aliases: ['busan', '부산', '부산시', '부산광역시'],
    latitude: 35.1796,
    longitude: 129.0756,
  },
  incheon: {
    aliases: ['incheon', '인천', '인천시', '인천광역시'],
    latitude: 37.4563,
    longitude: 126.7052,
  },
  daegu: {
    aliases: ['daegu', '대구', '대구시', '대구광역시'],
    latitude: 35.8714,
    longitude: 128.6014,
  },
  daejeon: {
    aliases: ['daejeon', '대전', '대전시', '대전광역시'],
    latitude: 36.3504,
    longitude: 127.3845,
  },
  gwangju: {
    aliases: ['gwangju', '광주', '광주시', '광주광역시'],
    latitude: 35.1595,
    longitude: 126.8526,
  },
  ulsan: {
    aliases: ['ulsan', '울산', '울산시', '울산광역시'],
    latitude: 35.5384,
    longitude: 129.3114,
  },
  suwon: {
    aliases: ['suwon', '수원', '수원시'],
    latitude: 37.2636,
    longitude: 127.0286,
  },
  jeju: {
    aliases: ['jeju', '제주', '제주시', '제주도', '제주특별자치도'],
    latitude: 33.4996,
    longitude: 126.5312,
  },
  newyork: {
    aliases: ['newyork', 'new york', '뉴욕', 'nyc'],
    latitude: 40.7128,
    longitude: -74.006,
  },
  losangeles: {
    aliases: ['losangeles', 'los angeles', 'la', '로스앤젤레스'],
    latitude: 34.0522,
    longitude: -118.2437,
  },
  chicago: {
    aliases: ['chicago', '시카고'],
    latitude: 41.8781,
    longitude: -87.6298,
  },
  sanfrancisco: {
    aliases: ['sanfrancisco', 'san francisco', 'sf', '샌프란시스코'],
    latitude: 37.7749,
    longitude: -122.4194,
  },
  toronto: {
    aliases: ['toronto', '토론토'],
    latitude: 43.6532,
    longitude: -79.3832,
  },
  vancouver: {
    aliases: ['vancouver', '밴쿠버'],
    latitude: 49.2827,
    longitude: -123.1207,
  },
  london: {
    aliases: ['london', '런던'],
    latitude: 51.5074,
    longitude: -0.1278,
  },
  paris: {
    aliases: ['paris', '파리'],
    latitude: 48.8566,
    longitude: 2.3522,
  },
  berlin: {
    aliases: ['berlin', '베를린'],
    latitude: 52.52,
    longitude: 13.405,
  },
  amsterdam: {
    aliases: ['amsterdam', '암스테르담'],
    latitude: 52.3676,
    longitude: 4.9041,
  },
  tokyo: {
    aliases: ['tokyo', '도쿄', '동경'],
    latitude: 35.6895,
    longitude: 139.6917,
  },
};

export const DEFAULT_BIRTH_LOCATION: BirthLocation = {
  cityName: '서울',
  latitude: 37.5665,
  longitude: 126.978,
  isDefault: true,
};

function normalizeCityName(cityName?: string): string {
  return cityName?.trim().toLowerCase() ?? '';
}

function findCityRecord(cityName?: string): BirthLocation | null {
  const normalized = normalizeCityName(cityName);
  if (!normalized) return null;

  for (const record of Object.values(CITY_TABLE)) {
    if (!record.aliases.includes(normalized)) continue;
    return {
      cityName: cityName?.trim() || '서울',
      latitude: record.latitude,
      longitude: record.longitude,
      isDefault: false,
    };
  }

  return null;
}

export function resolveBirthLocation(options: {
  cityName?: string;
  latitude?: number;
  longitude?: number;
}): BirthLocation {
  const hasCoordinates =
    typeof options.latitude === 'number' &&
    Number.isFinite(options.latitude) &&
    typeof options.longitude === 'number' &&
    Number.isFinite(options.longitude);

  if (hasCoordinates) {
    return {
      cityName: options.cityName?.trim() || '직접 입력 좌표',
      latitude: options.latitude as number,
      longitude: options.longitude as number,
      isDefault: false,
    };
  }

  const cityRecord = findCityRecord(options.cityName);
  if (cityRecord) return cityRecord;

  return {
    ...DEFAULT_BIRTH_LOCATION,
    cityName: options.cityName?.trim() || DEFAULT_BIRTH_LOCATION.cityName,
  };
}
