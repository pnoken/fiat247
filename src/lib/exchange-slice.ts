import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Exchange } from '@tbdex/http-client';
import { RootState } from './store';
import { formatMessages } from '@/utils/helpers/format-msg';

interface ExchangeState {
    isCreating: boolean;
    isFetching: boolean;
    exchange: any | null;
    error: string | null;
    exchanges: Exchange[];
}

const initialState: ExchangeState = {
    isCreating: false,
    isFetching: false,
    exchange: null,
    error: null,
    exchanges: [],
};

// Async thunk to create an exchange
export const createExchange = createAsyncThunk<any, {
    offering: any;
    amount: string;
    payinPaymentDetails: any;
    payoutPaymentDetails: any;
}, { rejectValue: string }>(
    'exchange/create',
    async ({ offering, amount, payinPaymentDetails, payoutPaymentDetails }, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const { customerCredentials, customerDid } = state.wallet;
        const { PresentationExchange } = await import('@web5/credentials');
        const { TbdexHttpClient, Rfq } = await import('@tbdex/http-client');
        try {
            // Select credentials required for the exchange
            const selectedCredentials = PresentationExchange.selectCredentials({
                vcJwts: customerCredentials as unknown as string[],
                presentationDefinition: offering.data.requiredClaims,
            });
            const { DidDht } = await import('@web5/dids');
            const signedCustomerDid = await DidDht.import({ portableDid: customerDid });

            // Create RFQ (Request for Quote)
            const rfq = Rfq.create({
                metadata: {
                    from: signedCustomerDid.uri,
                    to: offering.metadata.from,
                    protocol: '1.0',
                },
                data: {
                    offeringId: offering.metadata.id,
                    payin: {
                        amount: amount,
                        kind: offering.data.payin.methods[0].kind,
                        paymentDetails: payinPaymentDetails,
                    },
                    payout: {
                        kind: offering.data.payout.methods[0].kind,
                        paymentDetails: payoutPaymentDetails,
                    },
                    claims: selectedCredentials,
                },
            });

            try {
                // Verify offering requirements
                await rfq.verifyOfferingRequirements(offering)
            } catch (e) {
                console.log("offering requirements not met", e);
            }

            // Sign RFQ message
            await rfq.sign(signedCustomerDid);

            // Create exchange using TbdexHttpClient
            const exchangeResponse = await TbdexHttpClient.createExchange(rfq);

            return exchangeResponse;



        } catch (error) {
            console.error('Failed to create exchange', error);
            return thunkAPI.rejectWithValue('Failed to create exchange: ' + (error as Error).message);
        }
    }
);

// Updated async thunk for fetching exchanges
export const fetchExchanges = createAsyncThunk<Exchange[], string, { state: RootState }>(
    'exchange/fetchExchanges',
    async (pfiUri, { getState }) => {
        const { TbdexHttpClient } = await import('@tbdex/http-client');
        const state = getState();
        const { DidDht } = await import('@web5/dids');
        const signedCustomerDid = await DidDht.import({ portableDid: state.wallet.customerDid });
        const exchanges = await TbdexHttpClient.getExchanges({
            pfiDid: pfiUri,
            did: signedCustomerDid
        });
        return formatMessages(exchanges);
    }
);

// New async thunk to close an exchange
export const closeExchange = createAsyncThunk<any, {
    exchangeId: string;
    pfiUri: string;
    reason: string;
}, { state: RootState }>(
    'exchange/close',
    async ({ exchangeId, pfiUri, reason }, { getState }) => {
        const { TbdexHttpClient, Close } = await import('@tbdex/http-client');
        const state = getState();
        const { DidDht } = await import('@web5/dids');
        const signedCustomerDid = await DidDht.import({ portableDid: state.wallet.customerDid });

        try {
            const close = Close.create({
                metadata: {
                    from: signedCustomerDid.uri,
                    to: pfiUri,
                    exchangeId: exchangeId,
                    protocol: '1.0'
                },
                data: { reason }
            });

            await close.sign(signedCustomerDid);
            const response = await TbdexHttpClient.submitClose(close);
            return response;
        } catch (error) {
            console.error('Failed to close exchange', error);
            throw error;
        }
    }
);

// New async thunk to place an order
export const placeOrder = createAsyncThunk<any, {
    exchangeId: string;
    pfiUri: string;
}, { state: RootState }>(
    'exchange/placeOrder',
    async ({ exchangeId, pfiUri }, { getState }) => {
        const { TbdexHttpClient, Order } = await import('@tbdex/http-client');
        const state = getState();
        const { DidDht } = await import('@web5/dids');
        const signedCustomerDid = await DidDht.import({ portableDid: state.wallet.customerDid });

        try {
            const order = Order.create({
                metadata: {
                    from: signedCustomerDid.uri,
                    to: pfiUri,
                    exchangeId: exchangeId,
                    protocol: '1.0'
                }
            });

            await order.sign(signedCustomerDid);
            const response = await TbdexHttpClient.submitOrder(order);
            console.log("response", response);
            return response;
        } catch (error) {
            console.error('Failed to place order', error);
            throw error;
        }
    }
);

// Slice definition
const exchangeSlice = createSlice({
    name: 'exchange',
    initialState,
    reducers: {
        resetExchangeState: (state) => {
            state.isCreating = false;
            state.isFetching = false;
            state.exchange = null;
            state.exchanges = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createExchange.pending, (state) => {
                state.isCreating = true;
                state.error = null;
            })
            .addCase(createExchange.fulfilled, (state, action) => {
                state.isCreating = false;
                state.exchange = action.payload;
                state.error = null;
            })
            .addCase(createExchange.rejected, (state, action) => {
                state.isCreating = false;
                state.error = action.payload ?? 'An unknown error occurred';
                // Ensure we're not storing any non-serializable data
                state.exchange = null;
            })
            .addCase(fetchExchanges.pending, (state) => {
                state.isFetching = true;
                state.error = null;
            })
            .addCase(fetchExchanges.fulfilled, (state, action) => {
                state.isFetching = false;
                state.exchanges = action.payload;
                state.error = null;
            })
            .addCase(fetchExchanges.rejected, (state, action) => {
                state.isFetching = false;
                state.error = action.payload as string;
            })
            .addCase(closeExchange.pending, (state) => {
                state.isCreating = true;
                state.error = null;
            })
            .addCase(closeExchange.fulfilled, (state, action) => {
                state.isCreating = false;
                // Update the specific exchange in the exchanges array
                // const index = state.exchanges.findIndex(e => e.exchangeId === action.payload.exchangeId);
                // if (index !== -1) {
                //     state.exchanges[index] = action.payload;
                // }
                state.error = null;
            })
            .addCase(closeExchange.rejected, (state, action) => {
                state.isCreating = false;
                state.error = action.error.message ?? 'Failed to close exchange';
            })
            .addCase(placeOrder.pending, (state) => {
                state.isCreating = true;
                state.error = null;
            })
            .addCase(placeOrder.fulfilled, (state, action) => {
                state.isCreating = false;
                // Update the specific exchange in the exchanges array
                // const index = state.exchanges.findIndex(e => e.exchangeId === action.payload.exchangeId);
                // if (index !== -1) {
                //     state.exchanges[index] = action.payload;
                // }
                state.error = null;
            })
            .addCase(placeOrder.rejected, (state, action) => {
                state.isCreating = false;
                state.error = action.error.message ?? 'Failed to place order';
            });
    },
});

export const { resetExchangeState } = exchangeSlice.actions;

export default exchangeSlice.reducer;
