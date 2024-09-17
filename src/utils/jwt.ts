import { encode, decode } from 'next-auth/jwt';

const JWT_SECRET = 'your_secret_key_here'; // Replace with your actual secret

export const encodeJWT = async (payload: any): Promise<string> => {
    try {
        // Ensure payload is a plain object
        const safePayload = JSON.parse(JSON.stringify(payload));
        const token = await encode({
            token: safePayload,
            secret: JWT_SECRET!,
            maxAge: 30 * 24 * 60 * 60 // 30 days
        });
        return token;
    } catch (error) {
        console.error('Failed to encode JWT:', error);
        throw error;
    }
};

export const decodeJWT = async (token: string): Promise<any> => {
    try {
        const decoded = await decode({
            token,
            secret: JWT_SECRET!
        });
        return decoded;
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
};