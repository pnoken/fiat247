interface CredentialProps {
    customerName: string,
    countryCode: string,
    customerDID: string
}

export const fetchCredentialToken = async ({ customerName, countryCode, customerDID }: CredentialProps) => {
    try {
        const response = await fetch(
            `https://mock-idv.tbddev.org/kcc?name=${customerName}&country=${countryCode}&did=${customerDID}`
        );
        const jwtToken = await response.text(); // Get the JWT token as a string
        return jwtToken;
    } catch (error) {
        console.error('Failed to fetch credential token', error);
    }
};