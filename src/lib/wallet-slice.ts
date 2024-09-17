import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { VerifiableCredential } from '@web5/credentials';
import { RootState } from './store';
import { isClient } from '@/utils/isClient';
import { storeCredential, getStoredCredential } from '@/utils/secure-storage';

// Define the structure for a token balance
interface TokenBalance {
    token: string;
    amount: number;
    usdRate: number;
    image: string;
}

// Define the structure for payment methods
interface PaymentMethods {
    type: string;
    details: {}
}

// Extend the WalletState interface
interface WalletState {
    customerDid: any | null; // Initial portable DID state
    did: string; // Initial DID URI state
    isCreating: boolean; // State for creating process
    walletCreated: boolean; // State to confirm wallet creation
    error: string | null; // Error state
    customerCredentials: VerifiableCredential[];
    tokenBalances: TokenBalance[]; // New property for token balances
    paymentMethods: PaymentMethods[]
}

interface WalletState {
    encryptedMasterPassword: string | null;
    iv: string | null;
    isLocked: boolean;
    // ... other wallet state properties
}

const storedDid = isClient ? localStorage.getItem('customerDid') : null;
const STORAGE_KEY = 'wallet_balances';

const initialTokenBalances: TokenBalance[] = [
    { token: 'USDC', amount: 100.50, usdRate: 1, image: `/images/currencies/usdc.png` },
    { token: 'USDT', amount: 75.25, usdRate: 1, image: `/images/currencies/usdt.png` },
    { token: 'GHS', amount: 500.00, usdRate: 0.0833, image: `/images/currencies/ghs.png` },
    { token: 'KES', amount: 10000.00, usdRate: 0.00694, image: `/images/currencies/kes.png` },
    { token: 'USD', amount: 500.00, usdRate: 1, image: `/images/currencies/usd.png` },
    { token: 'NGN', amount: 10000.00, usdRate: 0.00060, image: `/images/currencies/ngn.png` },
    { token: 'GBP', amount: 300.00, usdRate: 1.315, image: `/images/currencies/gbp.png` },
    { token: 'EUR', amount: 350.00, usdRate: 1.110, image: `/images/currencies/eur.png` }
];

// Function to load balances from localStorage
const loadBalancesFromStorage = (): TokenBalance[] => {
    if (typeof window !== 'undefined') {
        const storedBalances = localStorage.getItem(STORAGE_KEY);
        return storedBalances ? JSON.parse(storedBalances) : initialTokenBalances;
    }
    return initialTokenBalances;
};


// Function to save balances to localStorage
const saveBalancesToStorage = (balances: TokenBalance[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(balances));
    }
};

const initialState: WalletState = {
    customerDid: storedDid ? JSON.parse(storedDid) : null,
    did: '',
    isCreating: false,
    walletCreated: false,
    error: null,
    customerCredentials: [],
    encryptedMasterPassword: null,
    iv: null,
    isLocked: true,
    tokenBalances: loadBalancesFromStorage(),
    paymentMethods: [
        {
            type: 'bank_account',
            details: { accountNumber: '1234567890', bankName: 'Simulated Bank' }
        },
        {
            type: 'evm_address',
            details: { address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' }
        },
        {
            type: 'card',
            details: {
                cardNumber: '**** **** **** 1234',
                expiryDate: '12/25',
                cardType: 'Visa',
                cardHolderName: 'Alice Doe',
                cvv: '**3'
            }
        }
    ]
};

// Add this new interface for the balance update payload
interface BalanceUpdatePayload {
    fromCurrency: string;
    toCurrency: string;
    fromAmount: number;
    toAmount: number;
}

// Async thunk to create a new wallet
export const createNewWallet = createAsyncThunk<
    { customerDid: any; did: string },
    void,
    { rejectValue: string }
>('wallet/createNewWallet', async (_, thunkAPI) => {
    try {
        const { DidDht } = await import('@web5/dids');
        const didDht = await DidDht.create({ options: { publish: true } }); // Create new DID

        const did = didDht.uri;
        const customerDid = await didDht.export(); // Export portable DID

        //Temporarily set customer Did (whilst finding a sln to decode Did)
        localStorage.setItem("customerDid", JSON.stringify(customerDid));

        // const encodedDid = await encodeJWT(customerDid);
        // Cookies.set('customerDid', encodedDid, { expires: 10 });

        return { customerDid, did }; // Return DID for further state management
    } catch (error) {
        console.error('Error creating wallet:', error);
        return thunkAPI.rejectWithValue('Failed to create a new wallet'); // Handle errors
    }
});

export const loadStoredCredentials = createAsyncThunk(
    'wallet/loadStoredCredentials',
    async () => {
        return await getStoredCredential();
    }
);

// Add this new async thunk
export const setUserCredentials = createAsyncThunk<
    VerifiableCredential[],
    VerifiableCredential,
    { state: RootState, rejectValue: string }
>('wallet/setUserCredentials', async (credential, thunkAPI) => {
    try {
        const state = thunkAPI.getState().wallet;
        const updatedCredentials = [...state.customerCredentials, credential];
        await storeCredential(updatedCredentials);
        return updatedCredentials;
    } catch (error) {
        return thunkAPI.rejectWithValue('Failed to set user credentials');
    }
});

// Add this function to initialize the state
export const initializeWallet = createAsyncThunk(
    'wallet/initializeWallet',
    async (_, thunkAPI) => {
        const storedDid = localStorage.getItem('customerDid');
        if (storedDid) {
            try {
                if (storedDid) {
                    return storedDid
                }
            } catch (error) {
                console.error('Failed to find stored DID:', error);
            }
        }
        return null;
    }
);

const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        clearWalletState: (state) => {
            state.customerDid = null;
            state.did = '';
            state.isCreating = false;
            state.walletCreated = false;
            state.error = null;
            state.tokenBalances = []; // Clear token balances
            state.paymentMethods = [];
            Cookies.remove('customerDid');
        },
        clearCredentials: (state) => {
            state.customerCredentials = [];
            storeCredential([]);
        },
        setCredentials: (state, action: PayloadAction<VerifiableCredential>) => {
            state.customerCredentials = [action.payload];
            storeCredential([action.payload]);
        },
        verifyCredential: (state, action: PayloadAction<{ issuer: string }>) => {
            const credential = state.customerCredentials.find(vc => vc.issuer === action.payload.issuer);
            if (credential) {
                //   credential.verified = true;
                credential.issuer = action.payload.issuer;
            }
        },
        updateTokenBalance: (state, action: PayloadAction<TokenBalance>) => {
            const index = state.tokenBalances.findIndex(tb => tb.token === action.payload.token);
            if (index !== -1) {
                state.tokenBalances[index] = action.payload;
            } else {
                state.tokenBalances.push(action.payload);
            }
        },
        removeTokenBalance: (state, action: PayloadAction<string>) => {
            state.tokenBalances = state.tokenBalances.filter(tb => tb.token !== action.payload);
        },
        addPaymentMethod: (state, action: PayloadAction<PaymentMethods>) => {
            state.paymentMethods.push(action.payload);
        },
        removePaymentMethod: (state, action: PayloadAction<number>) => {
            state.paymentMethods.splice(action.payload, 1);
        },
        setMasterPassword: (state, action: PayloadAction<{ encryptedPassword: string, iv: string }>) => {
            state.encryptedMasterPassword = action.payload.encryptedPassword;
            state.iv = action.payload.iv;
            state.isLocked = false;
        },
        lockWallet: (state) => {
            state.isLocked = true;
        },
        unlockWallet: (state) => {
            state.isLocked = false;
        },
        updateBalanceAfterExchange: (state, action: PayloadAction<BalanceUpdatePayload>) => {
            const { fromCurrency, toCurrency, fromAmount, toAmount } = action.payload;

            // Find and update the 'from' currency balance
            const fromBalanceIndex = state.tokenBalances.findIndex(tb => tb.token === fromCurrency);
            if (fromBalanceIndex !== -1) {
                state.tokenBalances[fromBalanceIndex].amount -= fromAmount;
            }

            // Find and update the 'to' currency balance
            const toBalanceIndex = state.tokenBalances.findIndex(tb => tb.token === toCurrency);
            if (toBalanceIndex !== -1) {
                state.tokenBalances[toBalanceIndex].amount += toAmount;
            } else {
                // If the 'to' currency doesn't exist in the balances, add it
                state.tokenBalances.push({
                    token: toCurrency,
                    amount: toAmount,
                    usdRate: 1, // You might want to fetch the actual rate
                    image: `/images/currencies/${toCurrency.toLowerCase()}.png`
                });
            }
            // Save updated balances to localStorage
            saveBalancesToStorage(state.tokenBalances);
        },
        resetBalances: (state) => {
            state.tokenBalances = initialTokenBalances;
            saveBalancesToStorage(state.tokenBalances);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createNewWallet.fulfilled, (state, action) => {
                state.isCreating = false;
                state.walletCreated = true;
                state.customerDid = action.payload.customerDid;
                state.did = action.payload.did;
                state.customerCredentials = [];
            })
            .addCase(createNewWallet.rejected, (state, action) => {
                state.isCreating = false;
                state.walletCreated = false; // Reset wallet creation status
                state.error = action.payload ?? null; // Store error message
            })
            .addCase(setUserCredentials.fulfilled, (state, action) => {
                state.customerCredentials = action.payload;
            })
            .addCase(setUserCredentials.rejected, (state, action) => {
                state.error = action.payload ?? null;
            })
            .addCase(initializeWallet.fulfilled, (state, action) => {
                if (action.payload) {
                    state.customerDid = action.payload,
                        state.walletCreated = true;
                }
            })
            .addCase(loadStoredCredentials.fulfilled, (state, action) => {
                state.customerCredentials = action.payload || [];
            })

    },
});

export const {
    setMasterPassword,
    setCredentials,
    lockWallet,
    unlockWallet,
    clearWalletState,
    clearCredentials,
    updateTokenBalance,
    removeTokenBalance,
    updateBalanceAfterExchange,
    resetBalances
} = walletSlice.actions; // Export clear actions

export default walletSlice.reducer;
