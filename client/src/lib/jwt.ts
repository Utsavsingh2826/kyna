export function getJwtExpiryMs(token: string): number | null {
    try {
        const payloadBase64 = token.split(".")[1];
        if (!payloadBase64) return null;

        // Decode base64
        // Using globalThis.atob which works in modern browsers
        const decodedPayload = JSON.parse(
            atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"))
        );

        if (decodedPayload.exp) {
            return decodedPayload.exp * 1000;
        }
        return null;
    } catch (error) {
        console.error("Error decoding JWT:", error);
        return null;
    }
}

export function isJwtExpired(token: string): boolean {
    if (!token) return true;
    const expiryMs = getJwtExpiryMs(token);
    if (!expiryMs) return true;
    return Date.now() >= expiryMs;
}
