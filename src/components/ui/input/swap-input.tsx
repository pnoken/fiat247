import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface SwapInputProps {
    label: string;
    placeholder: string;
    value: string;
    selectValue: string;
    onReset: () => void;
    onChange: (value: string) => void;
    isReadOnly?: boolean;
    selectedBalance: number;
}

export const SwapInput: React.FC<SwapInputProps> = ({
    label,
    selectValue,
    placeholder,
    onChange,
    value,
    onReset,
    selectedBalance,
    isReadOnly = false,
}) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [error, setError] = useState('');

    useEffect(() => {
        setDisplayValue(formatNumber(value));
    }, [value]);

    const formatNumber = (num: string) => {
        const parts = num.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value.replace(/[^0-9.]/g, '');
        const parts = inputValue.split('.');
        if (parts.length > 2) return; // Prevent multiple decimal points
        if (parts[1] && parts[1].length > 2) return; // Limit to 2 decimal places

        // Prevent multiple decimal points
        if (parts.length > 2) return;

        // Remove leading zeros before a whole number
        if (parts[0].length > 1 && parts[0].startsWith('0')) {
            parts[0] = parts[0].replace(/^0+/, '');
        }

        inputValue = parts.join('.');


        const numericValue = parseFloat(inputValue);
        if (numericValue > selectedBalance) {
            setError("You don't have enough funds to complete the transaction.");
        }
        if (numericValue === 0) {
            setError("");
        }
        else {
            setError('');
        }

        onChange(inputValue);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="py-4 sm:py-6 px-4 sm:px-6 relative w-full min-h-fit bg-white/10 flex flex-col items-center rounded-2xl border border-white/20 shadow-lg"
        >
            <div className="flex items-center justify-between w-full font-medium mb-4 text-white/80">
                <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold">{label}</span>
                    {!isReadOnly && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-white/60 hover:text-white transition-colors duration-300"
                            aria-label="Reset values"
                            onClick={onReset}
                        >
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-base" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z" />
                            </svg>
                        </motion.button>
                    )}
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="text-xs sm:text-sm gap-1.5 flex items-center cursor-pointer text-white/80 hover:text-white transition-all duration-300"
                    aria-label="Wallet Balance"
                >
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="text-xs relative top-[1px]" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V192c0-35.3-28.7-64-64-64H80c-8.8 0-16-7.2-16-16s7.2-16 16-16H448c17.7 0 32-14.3 32-32s-14.3-32-32-32H64zM416 272a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
                    </svg>
                    {selectedBalance.toFixed(2)}
                </motion.button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center bg-white/20 text-white py-2 px-3 rounded-lg transition-colors duration-300 hover:bg-white/30 mb-2 sm:mb-0 sm:mr-3"
                >
                    <Image
                        src={`/images/currencies/${selectValue.toLowerCase()}.png`}
                        alt={`${selectValue} logo`}
                        width={20}
                        height={20}
                        className="rounded-full mr-2"
                    />
                    <span className="text-sm sm:text-base font-semibold">{selectValue}</span>

                </motion.button>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={displayValue}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className="flex-grow bg-transparent text-white font-semibold outline-none text-xl sm:text-3xl w-full sm:w-auto text-right"
                />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </motion.div>
    );
};