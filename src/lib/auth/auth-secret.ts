export function requireAuthSecret(context: string): Uint8Array {
    const secret = process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();

    if (!secret) {
        throw new Error(`${context} requires AUTH_SECRET or NEXTAUTH_SECRET to be configured`);
    }

    return new TextEncoder().encode(secret);
}
