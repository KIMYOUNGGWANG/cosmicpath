
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * Helper to get a descriptive value for AI guidance based on Zod definition.
 */
function getFieldDescription(def: any): string {
    if (!def) return "string";

    // Explicit types for Zod 4.2.1 (Current environment)
    if (def.type === 'number') return "number (MUST be an integer between 0 and 100, do NOT add symbols like % or /100)";
    if (def.type === 'enum' && def.entries) return `string (MUST be exactly one of: ${Object.keys(def.entries).join('|')})`;
    if (def.type === 'string') return "string";

    // Compatibility fallbacks for standard Zod versions
    const typeName = def.typeName;
    if (typeName === 'ZodNumber') return "number (MUST be an integer between 0 and 100, do NOT add symbols like % or /100)";
    if (typeName === 'ZodEnum' && def.values) return `string (MUST be exactly one of: ${def.values.join('|')})`;

    return "string";
}

/**
 * Recursively extracts the structure of a Zod schema for AI guidance.
 */
function getSchemaStructure(field: any): any {
    const def = field?._def;
    if (!def) return "string";

    // Handle Objects
    if (def.shape) {
        const shape = typeof def.shape === 'function' ? def.shape() : def.shape;
        const subObj: Record<string, any> = {};
        Object.keys(shape).forEach(key => {
            subObj[key] = getSchemaStructure(shape[key]);
        });
        return subObj;
    }

    // Handle Arrays
    if (def.element) {
        return [getSchemaStructure(def.element)];
    }

    // Handle Primitives
    return getFieldDescription(def);
}

/**
 * Converts a Zod schema to a JSON Schema string for AI prompts.
 * Optimized for LLM understanding (removes unnecessary metadata).
 */
export function getSchemaPrompt(schema: any, description?: string): string {
    let cleanSchema = '{}';
    try {
        const jsonSchema = zodToJsonSchema(schema, {
            target: 'jsonSchema7',
        });

        // Check if schema is meaningful (not just $schema)
        if (jsonSchema && typeof jsonSchema === 'object' && Object.keys(jsonSchema).length > 1) {
            cleanSchema = JSON.stringify(jsonSchema);
        } else {
            // Fallback: If library fails (e.g. Zod version mismatch)
            const structure = getSchemaStructure(schema);
            cleanSchema = JSON.stringify(structure, null, 2);
        }
    } catch (e) {
        console.error("Schema conversion error:", e);
    }

    return `
${description ? `## ${description}` : '## Output Format (JSON)'}
IMPORTANT: You must respond ONLY with raw JSON. 
Do NOT wrap in markdown backticks.
Ensure all JSON keys and string values are in double quotes.
Follow the structure below EXACTLY. 

### Critical Data Format Rules:
1. **Arrays**: All fields marked as [ "..." ] MUST be returned as a JSON array of strings, NOT a single comma-separated string.
   - Example: "triggerTopics": ["Topic A", "Topic B", "Topic C"]
2. **Numbers**: MUST be plain numeric integers (0-100). No symbols.
3. **Enums**: Use only the allowed values provided.
4. **JSON Safety**: 
   - **NO internal double quotes**: If you must use a quote inside a string, use a single quote (') or escape it (\").
   - **NO raw newlines**: Use \\n for newlines within a string value.
   - **NO trailing commas**: Ensure the last element in an object or array does not have a trailing comma.

### Targeted JSON Structure:
${cleanSchema}
`;
}
