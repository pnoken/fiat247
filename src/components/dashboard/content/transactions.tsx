import React from 'react';
import { RootState } from '@/lib/store';
import { useAppSelector } from '@/hooks/use-app-dispatch';
import { FaExchangeAlt } from 'react-icons/fa';
import { Exchange } from '@tbdex/http-client';

interface ExchangeWithPfiDid extends Exchange {
    pfiDid: string;
    id: string;
    payinCurrency: string;
    payoutCurrency: string;
    payinAmount: string;
    payoutAmount: string;
    status: string
}

export const TransactionList: React.FC = () => {
    const { exchanges } = useAppSelector((state: RootState) => state.exchange);

    return (
        <div className="h-full bg-white shadow-xl rounded-lg overflow-hidden md:ml-24">
            <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>
                <FaExchangeAlt className="text-gray-600 text-xl" />
            </div>
            <div className="overflow-y-auto h-[calc(100%-4rem)]">
                {exchanges.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <FaExchangeAlt className="text-5xl mb-4 text-gray-400" />
                        <p className="text-lg">No active exchanges</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {exchanges.map((exchange) => {
                            const { id, payinAmount, status, payoutAmount, payinCurrency, payoutCurrency } = exchange as ExchangeWithPfiDid;
                            return (
                                <li key={id} className="p-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="font-semibold text-lg text-gray-800">
                                                {payinAmount} {payinCurrency} → {payoutAmount} {payoutCurrency}
                                            </span>
                                            <p className="text-sm text-gray-600 mt-1">ID: {id?.slice(0, 8)}...</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${status === 'completed' ? 'bg-green-100 text-green-800' :
                                            status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {status}
                                        </span>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};