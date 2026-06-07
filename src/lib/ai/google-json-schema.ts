import { z } from 'zod';

export type GoogleSchemaObject = Record<string, unknown>;

const SUPPORTED_GOOGLE_JSON_SCHEMA_KEYS = new Set([
    '$id',
    '$defs',
    '$ref',
    '$anchor',
    'type',
    'format',
    'title',
    'description',
    'enum',
    'items',
    'prefixItems',
    'minItems',
    'maxItems',
    'minimum',
    'maximum',
    'anyOf',
    'oneOf',
    'properties',
    'additionalProperties',
    'required',
    'propertyOrdering',
]);

export function sanitizeGoogleJsonSchema(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value
            .map((item) => sanitizeGoogleJsonSchema(item))
            .filter((item) => item !== undefined);
    }

    if (!value || typeof value !== 'object') {
        return value;
    }

    const source = value as GoogleSchemaObject;
    const sanitized: GoogleSchemaObject = {};

    for (const [key, childValue] of Object.entries(source)) {
        if (!SUPPORTED_GOOGLE_JSON_SCHEMA_KEYS.has(key)) {
            continue;
        }

        if (key === 'properties' && childValue && typeof childValue === 'object' && !Array.isArray(childValue)) {
            const nextProperties: GoogleSchemaObject = {};

            for (const [propertyKey, propertyValue] of Object.entries(childValue as GoogleSchemaObject)) {
                const sanitizedProperty = sanitizeGoogleJsonSchema(propertyValue);
                if (sanitizedProperty !== undefined) {
                    nextProperties[propertyKey] = sanitizedProperty;
                }
            }

            sanitized.properties = nextProperties;
            continue;
        }

        const sanitizedChild = sanitizeGoogleJsonSchema(childValue);
        if (sanitizedChild !== undefined) {
            sanitized[key] = sanitizedChild;
        }
    }

    if (
        sanitized.type === 'object' &&
        sanitized.properties &&
        typeof sanitized.properties === 'object' &&
        !Array.isArray(sanitized.properties)
    ) {
        sanitized.propertyOrdering = Object.keys(sanitized.properties as GoogleSchemaObject);
    }

    return sanitized;
}

export function buildGoogleResponseJsonSchema<T>(schema?: z.ZodSchema<T>): GoogleSchemaObject | undefined {
    if (!schema) return undefined;

    const schemaWithJsonExport = schema as z.ZodSchema<T> & {
        toJSONSchema?: () => unknown;
    };

    if (typeof schemaWithJsonExport.toJSONSchema !== 'function') {
        return undefined;
    }

    try {
        const rawSchema = schemaWithJsonExport.toJSONSchema();
        const sanitizedSchema = sanitizeGoogleJsonSchema(rawSchema);

        if (sanitizedSchema && typeof sanitizedSchema === 'object' && !Array.isArray(sanitizedSchema)) {
            return sanitizedSchema as GoogleSchemaObject;
        }
    } catch (error) {
        console.warn('[AI Client] Failed to build response JSON schema for Gemini:', error);
    }

    return undefined;
}
