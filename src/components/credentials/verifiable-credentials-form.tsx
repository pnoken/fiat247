import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/use-app-dispatch';
import { setUserCredentials } from '@/lib/wallet-slice';
import { fetchCredentialToken } from '@/utils/request/fetch-credential-token';
import { toast } from 'react-hot-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface VerifiableCredentialsFormProps {
    onComplete: () => void;
}

const VerifiableCredentialsForm: React.FC<VerifiableCredentialsFormProps> = ({ onComplete }) => {
    const dispatch = useAppDispatch();
    const [name, setName] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [customerDid,] = useLocalStorage("customerDid", null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        //trying


        const credentials = { customerName: name, countryCode, customerDID: customerDid?.uri };

        try {
            const token = await fetchCredentialToken(credentials);
            dispatch(setUserCredentials(token));
            toast.success('Credentials set successfully!');
            onComplete();
        } catch (error) {
            console.error('Failed to set credentials:', error);
            toast.error('Failed to set credentials. Please try again.');
        } finally {
            setIsLoading(false);
            onComplete()
        }
    };

    return (
        <div className="max-w-md mx-auto"> {/* Add this wrapper div */}
            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-md">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label htmlFor="countryCode" className="block text-sm font-medium text-gray-300">Country Code</label>
                    <input
                        type="text"
                        id="countryCode"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                        required
                        maxLength={2}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                        placeholder="US"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !name || !countryCode}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Setting Credentials...' : 'Get Credentials'}
                </button>
            </form>
        </div>
    );
};

export default VerifiableCredentialsForm;