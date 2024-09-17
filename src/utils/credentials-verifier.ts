export const verifyVC = async (vc: string): Promise<string> => {
    const { VerifiableCredential } = await import('@web5/credentials');
    try {
        const result = await VerifiableCredential.verify({
            vcJwt: vc,
        });
        return result.issuer
    } catch (error) {
        console.error('Credential verification failed:', error);
        throw error; // Re-throw or return a default value
    }
};