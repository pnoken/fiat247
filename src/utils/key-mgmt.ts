import { PortableDid as Web5PortableDid } from '@web5/dids';
let AwsKeyManager: any;

if (typeof window === 'undefined') {
    AwsKeyManager = require('@web5/crypto-aws-kms').AwsKeyManager;
}

type Environment = 'production' | 'development' | 'test';


export async function initKeyManagement(env: Environment, portableDid: Web5PortableDid) {
    const { LocalKeyManager } = await import('@web5/crypto');
    // Determine which key manager to use based on the environment
    let keyManager;
    if (env === "production") {
        keyManager = new AwsKeyManager();
    } else {
        keyManager = new LocalKeyManager();
    }

    const { DidDht } = await import('@web5/dids');
    // Initialize or load a DID
    if (portableDid == null) {
        // Create a new DID

        return await DidDht.create(keyManager);
    } else {
        // Load existing DID
        return await DidDht.import({ portableDid, keyManager });
    }
}
