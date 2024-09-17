import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowsUpDownIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { SwapInput } from "../ui/input/swap-input";
import { useAppDispatch, useAppSelector } from "@/hooks/use-app-dispatch";
import { RootState } from "@/lib/store";
import { createExchange } from "@/lib/exchange-slice";
import { Offering } from "@tbdex/http-client";
import OfferingDetails from '../offerings/offering-details';
import SettingsDrawer from "../ui/drawer/settings";
import { SettingContent } from "../drawer/content/settings";

export const SwapSection: React.FC<{
    selectedCurrencyPair: { from: string; to: string };
    onCurrencyPairSelect: (from: string, to: string) => void;
    amount: string;
    onAmountChange: (value: string) => void;
    offering: Offering;
}> = ({ selectedCurrencyPair, onCurrencyPairSelect, amount, onAmountChange, offering }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [exchangeInfo, setExchangeInfo] = useState(null);
    const [showOfferingDetails, setShowOfferingDetails] = useState(false);
    const tokenBalances = useAppSelector((state: RootState) => state.wallet.tokenBalances);
    const { status, error: offeringError } = useAppSelector((state: RootState) => state.offering);
    const selectedBalance = tokenBalances.find(token => token.token === selectedCurrencyPair.from)?.amount || 0;
    //const { matchedOfferings, status, error: offeringError } = useOfferings(selectedCurrencyPair.from, selectedCurrencyPair.to);

    const handleReset = () => {
        onAmountChange('');
        onCurrencyPairSelect('GHS', 'USDC');
    };

    const currencies = ["GHS", "USDC", "KES", "NGN", "USD", "EUR", "GBP"];
    const filteredFromCurrencies = currencies.filter(currency => currency !== selectedCurrencyPair.to);
    const filteredToCurrencies = currencies.filter(currency => currency !== selectedCurrencyPair.from);
    const dispatch = useAppDispatch();
    const { isCreating } = useAppSelector((state: RootState) => state.exchange);

    useEffect(() => {
        if (!selectedCurrencyPair.from || !selectedCurrencyPair.to) {
            onCurrencyPairSelect('GHS', 'USDC');
        }
    }, [selectedCurrencyPair.from, selectedCurrencyPair.to, onCurrencyPairSelect]);

    const performExchange = useCallback(async () => {
        if (offeringError) {
            return <div>Error loading offering: {offeringError}</div>;
        }

        try {

            const payinPaymentDetails = (() => {
                switch (selectedCurrencyPair.from) {
                    case 'USD':
                        return {
                            accountNumber: "1234567890",
                            routingNumber: "123456"
                        };
                    case 'USDC':
                        return {
                            address: "0x1731d34b07ca2235e668c7b0941d4bfab370a2d0"
                        };
                    case 'GHS':
                    case 'KES':
                    case 'NGN':
                        return {
                            accountNumber: "1234567890",
                        };
                    case 'GBP':
                        return {
                            accountNumber: "1234567890",
                            sortCode: "GB231926819"
                        };
                    case 'EUR':
                        return {
                            accountNumber: "1234567890",
                            IBAN: "BE29NWBK60161331926819"
                        };
                    default:
                        throw new Error(`Unsupported payout currency: ${selectedCurrencyPair.to}`);
                }
            })();

            const payoutPaymentDetails = (() => {
                switch (selectedCurrencyPair.to) {
                    case 'USD':
                        return {
                            accountNumber: "1234567890",
                            routingNumber: "123456"
                        };
                    case 'USDC':
                        return {
                            address: "0x1731d34b07ca2235e668c7b0941d4bfab370a2d0"
                        };
                    case 'GHS':
                    case 'KES':
                    case 'NGN':
                        return {
                            accountNumber: "1234567890",
                        };
                    case 'GBP':
                        return {
                            accountNumber: "1234567890",
                            sortCode: "GB231926819"
                        };
                    case 'EUR':
                        return {
                            accountNumber: "1234567890",
                            IBAN: "BE29NWBK60161331926819"
                        };
                    default:
                        throw new Error(`Unsupported payout currency: ${selectedCurrencyPair.to}`);
                }
            })();

            const result = await dispatch(createExchange({
                offering,
                amount,
                payinPaymentDetails,
                payoutPaymentDetails
            }));

            if (result.type === "exchange/create/fulfilled") {
                onAmountChange('');
                setShowOfferingDetails(true);
                setExchangeInfo(result.payload);
                // Clear input
            }
        } catch (error) {
            console.error('Failed to create exchange:', error);
        }
    }, [dispatch, offering, amount, onAmountChange, selectedCurrencyPair.to, selectedCurrencyPair.from, offeringError]);

    const handleFromCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onCurrencyPairSelect(e.target.value, selectedCurrencyPair.to);
    };

    const handleToCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onCurrencyPairSelect(selectedCurrencyPair.from, e.target.value);
    };

    const handleAmountChange = (value: string) => {
        onAmountChange(value);
    };

    const isExchangeValid = useCallback(() => {

        const enteredAmount = parseFloat(amount);
        return selectedBalance > 0 && enteredAmount > 0 && !isCreating && status === 'succeeded';
    }, [amount, selectedBalance, isCreating, status]);

    const CurrencySelect: React.FC<{
        value: string;
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
        label: string;
        options: string[];
    }> = ({ value, onChange, label, options }) => (
        <div className="flex flex-col w-full sm:w-2/5 mb-4 sm:mb-0">
            <label className="text-white/80 mb-2">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={onChange}
                    className="w-full appearance-none bg-white/20 text-white py-3 sm:py-4 pl-12 pr-10 rounded-lg outline-none transition-colors duration-300 hover:bg-white/30 text-base sm:text-lg font-semibold"
                >
                    {options.map((currency) => (
                        <option key={currency} value={currency} className="bg-indigo-600 flex items-center">
                            {currency}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Image
                        src={`/images/currencies/${value.toLowerCase()}.png`}
                        alt={`${value} logo`}
                        width={28}
                        height={28}
                        className="rounded-full"
                    />
                </div>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {
                showOfferingDetails ? (
                    <OfferingDetails
                        onBack={() => setShowOfferingDetails(false)}
                    />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col p-4 sm:p-8 my-4 sm:my-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-2xl"
                    >
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
                            <CurrencySelect
                                value={selectedCurrencyPair.from}
                                onChange={handleFromCurrencyChange}
                                label="From"
                                options={filteredFromCurrencies}
                            />
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 180 }}
                                whileTap={{ scale: 0.9 }}
                                className="my-4 sm:my-0 bg-white text-indigo-600 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300"
                                onClick={() => onCurrencyPairSelect(selectedCurrencyPair.to, selectedCurrencyPair.from)}
                            >
                                <ArrowsUpDownIcon className="h-6 w-6" />
                            </motion.button>
                            <CurrencySelect
                                value={selectedCurrencyPair.to}
                                onChange={handleToCurrencyChange}
                                label="To"
                                options={filteredToCurrencies}
                            />
                        </div>
                        <div className="bg-white/10 p-4 sm:p-6 rounded-xl mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-white/80">You send</label>
                                <button
                                    className="text-white/80 hover:text-white"
                                    onClick={() => setIsDrawerOpen(true)}
                                >
                                    <Cog6ToothIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <SwapInput
                                label="You send"
                                placeholder="0.00"
                                value={amount}
                                onChange={handleAmountChange}
                                selectValue={selectedCurrencyPair.from}
                                onReset={handleReset}
                                selectedBalance={selectedBalance}
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`mt-4 py-3 sm:py-4 px-6 sm:px-8 rounded-full font-bold text-base sm:text-lg shadow-lg  ${isExchangeValid() ? 'bg-emerald-400 text-white hover:shadow-xl transition-all duration-300' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            onClick={performExchange}
                            disabled={!isExchangeValid()}
                        >
                            {"Exchange"}
                        </motion.button>
                        {
                            isDrawerOpen && <SettingsDrawer
                                isOpen={isDrawerOpen}
                                onClose={() => setIsDrawerOpen(false)}
                            >
                                <SettingContent />
                            </SettingsDrawer>
                        }
                    </motion.div>
                )}
        </>
    );
};

export default SwapSection;