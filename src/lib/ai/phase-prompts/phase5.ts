import { buildPhase5APrompt } from './phase5a';
import type { PremiumReportPartial, UserData } from './types';

export function buildPhase5Prompt(
  userData: UserData,
  previousData?: PremiumReportPartial | null
): { system: string; user: string } {
  return buildPhase5APrompt(userData, previousData);
}
