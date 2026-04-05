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
