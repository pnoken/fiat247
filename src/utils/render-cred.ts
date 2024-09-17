export const renderCredential = async (credentialJwt: any) => {
    const { Jwt } = await import('@web5/credentials');
    const vc = Jwt.parse({ jwt: credentialJwt }).decoded.payload['vc'] as any;
    return {
        title: vc.type[vc.type.length - 1].replace(/(?<!^)(?<![A-Z])[A-Z](?=[a-z])/g, ' $&'), // get the last credential type in the array and format it with spaces
        name: vc.credentialSubject['name'],
        countryCode: vc.credentialSubject['countryOfResidence'],
        issuanceDate: new Date(vc.issuanceDate).toLocaleDateString(undefined, { dateStyle: 'medium' }),
    }
}