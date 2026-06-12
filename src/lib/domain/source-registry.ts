import { ASTRO_TAROT_SOURCE_REGISTRY } from './source-registry-astro-tarot.ts';
import { CALCULATION_SOURCE_REGISTRY } from './source-registry-calculation.ts';
import { MYEONGLI_SOURCE_REGISTRY } from './source-registry-myeongli.ts';
import { PRODUCT_SOURCE_REGISTRY } from './source-registry-product.ts';
import type { SourceRegistryRecord } from './source-registry-types.ts';

export type { SourceDomain, SourceRegistryRecord } from './source-registry-types.ts';

export const SOURCE_REGISTRY = [
  ...CALCULATION_SOURCE_REGISTRY,
  ...MYEONGLI_SOURCE_REGISTRY,
  ...ASTRO_TAROT_SOURCE_REGISTRY,
  ...PRODUCT_SOURCE_REGISTRY,
] satisfies readonly SourceRegistryRecord[];

export function findSourceRegistryRecord(sourceId: string): SourceRegistryRecord | null {
  return SOURCE_REGISTRY.find((recordItem) => recordItem.sourceId === sourceId) ?? null;
}
