import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Offering } from '@tbdex/http-client';
import { mockProviderDids } from '@/constants/mockDids';

// Define the state type
interface OfferingsState {
    matchedOfferings: SerializedOffering[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

// Define a type for the serialized offering
interface SerializedOffering {
    metadata: {
        from: string;
        protocol: string;
        kind: string;
        id: string;
        createdAt: string;
    };
    data: {
        description: string;
        payoutUnitsPerPayinUnit: string;
        payout: any; // Consider creating a more specific type if possible
        payin: any; // Consider creating a more specific type if possible
        requiredClaims: any; // Consider creating a more specific type if possible
    };
    signature: string;
}

// Helper function to serialize an Offering
const serializeOffering = (offering: Offering): SerializedOffering => ({
    metadata: {
        from: offering.metadata.from,
        protocol: offering.metadata.protocol,
        kind: offering.metadata.kind,
        id: offering.metadata.id,
        createdAt: offering.metadata.createdAt,
    },
    data: {
        description: offering.data.description,
        payoutUnitsPerPayinUnit: offering.data.payoutUnitsPerPayinUnit,
        payout: offering.data.payout,
        payin: offering.data.payin,
        requiredClaims: offering.data.requiredClaims,
    },
    signature: offering.signature ?? '',
});

// Async thunk to fetch and filter offerings
export const fetchOfferings = createAsyncThunk<SerializedOffering[], { from: string; to: string }, { rejectValue: string }>(
    'offerings/fetchOfferings',
    async ({ from, to }, thunkAPI) => {
        const { TbdexHttpClient } = await import('@tbdex/http-client');
        try {
            const allOfferings: Offering[] = [];
            for (const pfi of Object.values(mockProviderDids)) {
                const offerings = await TbdexHttpClient.getOfferings({ pfiDid: pfi.uri });
                allOfferings.push(...offerings);
            }
            // Filter offerings based on the currency pair and serialize them
            return allOfferings
                .filter(offering =>
                    offering.data.payin.currencyCode === from &&
                    offering.data.payout.currencyCode === to
                )
                .map(serializeOffering);
        } catch (error) {
            return thunkAPI.rejectWithValue('Cannot fetch offerings');
        }
    }
);

const initialState: OfferingsState = {
    matchedOfferings: [],
    status: 'idle',
    error: null,
};

const offeringsSlice = createSlice({
    name: 'offerings',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOfferings.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchOfferings.fulfilled, (state, action: PayloadAction<SerializedOffering[]>) => {
                state.status = 'succeeded';
                state.matchedOfferings = action.payload;
            })
            .addCase(fetchOfferings.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload ?? 'An error occurred';
            });
    },
});

export default offeringsSlice.reducer;
