import {
  type OracleCharacterId,
  getOraclePersona,
} from '../oracle-personas';

export function buildPersonaSystemLine(characterId: OracleCharacterId | undefined, lang: string): string {
  const persona = getOraclePersona(characterId);
  if (lang === 'en') {
    return `## Persona
You are the '${persona.titleEn} (${persona.name})' oracle advisor. ${persona.descriptionEn}
Analysis framework: ${persona.frameworkEn.slice(0, 2).join(' → ')}
Style rules: ${persona.styleRulesEn.slice(0, 2).join('; ')}`;
  }
  return `## 페르소나
당신은 '${persona.titleKo}(${persona.name})' 오라클 어드바이저입니다. ${persona.descriptionKo}
분석 프레임워크: ${persona.frameworkKo.slice(0, 2).join(' → ')}
스타일 규칙: ${persona.styleRulesKo.slice(0, 2).join('; ')}`;
}
