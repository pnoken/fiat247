// src/store/walletSlice.js
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DidDht } from '@web5/dids';
import Cookies from 'js-cookie';
import { encodeJWT, decodeJWT } from '@/utils/jwt';
import { VerifiableCredential } from '@web5/credentials';
import { RootState } from './store';

// Define the structure for a token balance
interface TokenBalance {
    token: string;
    amount: number;
    usdRate: number;
    image: string;
}

// Async thunk to create a new wallet
export const createNewWallet = createAsyncThunk<
    { portableDid: any; did: string },
    void,
    { rejectValue: string }
>('wallet/createNewWallet', async (_, thunkAPI) => {
    try {
        const didDht = await DidDht.create({ options: { publish: true } }); // Create new DID

        const did = didDht.uri;
        const portableDid = await didDht.export(); // Export portable DID

        //Temporarily set customer Did (whilst finding a sln to decode Did)
        localStorage.setItem("customerDid", JSON.stringify(portableDid));

        // Encode the safe version of the DID
        const encodedDid = await encodeJWT(portableDid);
        Cookies.set('customerDid', encodedDid, { expires: 10 }); // Expires in 10 days

        return { portableDid, did }; // Return DID for further state management
    } catch (error) {
        console.error('Error creating wallet:', error);
        return thunkAPI.rejectWithValue('Failed to create a new wallet'); // Handle errors
    }
});

// Add this new async thunk
export const setUserCredentials = createAsyncThunk<
    VerifiableCredential[],
    VerifiableCredential,
    { state: RootState, rejectValue: string }
>('wallet/setUserCredentials', async (credential, thunkAPI) => {
    try {
        const state = thunkAPI.getState().wallet;
        const updatedCredentials = [...state.customerCredentials, credential];
        localStorage.setItem('customerCredentials', JSON.stringify(updatedCredentials));
        return updatedCredentials;
    } catch (error) {
        return thunkAPI.rejectWithValue('Failed to set user credentials');
    }
});

// Extend the WalletState interface
interface WalletState {
    portableDid: any | null; // Initial portable DID state
    did: string | null; // Initial DID URI state
    isCreating: boolean; // State for creating process
    walletCreated: boolean; // State to confirm wallet creation
    error: string | null; // Error state
    customerCredentials: VerifiableCredential[];
    tokenBalances: TokenBalance[]; // New property for token balances
}

const storedDid = localStorage.getItem('customerDid');

const initialState: WalletState = {
    portableDid: storedDid ? JSON.parse(storedDid) : null,
    did: null,
    isCreating: false,
    walletCreated: false,
    error: null,
    customerCredentials: JSON.parse(localStorage.getItem('customerCredentials') || '[]'),
    tokenBalances: [
        { token: 'USDC', amount: 100.50, usdRate: 1, image: `/images/currencies/usdc.png` },
        { token: 'USDT', amount: 75.25, usdRate: 1, image: `/images/currencies/usdt.png` },
        { token: 'GHS', amount: 500.00, usdRate: 0.0833, image: `/images/currencies/ghs.png` },
        { token: 'KES', amount: 10000.00, usdRate: 0.00694, image: `/images/currencies/kes.png` },
        { token: 'USD', amount: 500.00, usdRate: 1, image: `/images/currencies/usd.png` },
        { token: 'NGN', amount: 10000.00, usdRate: 0.00060, image: `/images/currencies/ngn.png` },
        { token: 'GBP', amount: 300.00, usdRate: 1.315, image: `/images/currencies/gbp.png` },
        { token: 'EUR', amount: 350.00, usdRate: 1.110, image: `/images/currencies/eur.png` }
    ],
};

// Add this function to initialize the state
export const initializeWallet = createAsyncThunk(
    'wallet/initializeWallet',
    async (_, thunkAPI) => {
        const storedDid = localStorage.getItem('customerDid');
        if (storedDid) {
            try {
                const customerDid = await DidDht.import({ portableDid: JSON.parse(storedDid) });
                if (customerDid) {
                    return customerDid
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
            state.portableDid = null;
            state.did = null;
            state.isCreating = false;
            state.walletCreated = false;
            state.error = null;
            state.tokenBalances = []; // Clear token balances
            Cookies.remove('customerDid');
        },
        clearUserCredentials: (state) => {
            state.customerCredentials = [];
            localStorage.removeItem('customerCredentials');
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
    },
    extraReducers: (builder) => {
        builder
            .addCase(createNewWallet.fulfilled, (state, action) => {
                state.isCreating = false;
                state.walletCreated = true;
                state.portableDid = action.payload.portableDid;
                state.did = action.payload.did;
                // Encode and store the DID
                encodeJWT(action.payload.portableDid).then(encodedDid => {
                    Cookies.set('customerDid', encodedDid, { expires: 10 }); // Expires in 10 days
                });
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
                    state.portableDid = action.payload,
                        state.did = action.payload.uri,
                        state.walletCreated = true;
                }
            })

    },
});

export const {
    clearWalletState,
    clearUserCredentials,
    updateTokenBalance,
    removeTokenBalance
} = walletSlice.actions; // Export clear actions

export default walletSlice.reducer;
