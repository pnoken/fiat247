'use client'

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { encryptData } from "@/utils/encryption/encrypt-data";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { EyeIcon, EyeSlashIcon, InformationCircleIcon, LockClosedIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { setMasterPassword } from '@/lib/wallet-slice'; // We'll create this action
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import TermsConditionsModal from "@/components/modals/terms-and-conditons";
import { useLocalStorage } from "@/hooks/use-local-storage";

const ConfirmPasswordForm: React.FC = () => {
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const dispatch = useAppDispatch()
    const [, setWalletLock] = useLocalStorage("walletLocked", 'false');
    const [, setLastActivity] = useLocalStorage('lastActivity', Date.now().toString());
    const [, setEncryptedPassword] = useLocalStorage("encryptedPassword", '');
    const [, setIv] = useLocalStorage("iv", '');
    const [understoodPassword, setUnderstoodPassword] = useState(false);

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (e.target.value !== confirmPassword) {
            setPasswordError("Passwords do not match");
        } else {
            setPasswordError("");
        }
    };

    useEffect(() => {
        const termsAccepted = localStorage.getItem('termsAccepted');
        if (!termsAccepted) {
            setIsModalOpen(true);
        }
    }, []);

    const handleStorePassword = async () => {
        try {
            const { encryptedPassword, iv } = await encryptData(password);
            dispatch(setMasterPassword({ encryptedPassword, iv }));
            setWalletLock
            setEncryptedPassword(encryptedPassword);
            setIv(iv);
            setLastActivity
        } catch (error) {
            console.error('Error encrypting password:', error);
            setPasswordError('An error occurred. Please try again.');
        }
    };

    const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        if (e.target.value !== password) {
            setPasswordError("Passwords do not match");
        } else {
            setPasswordError("");
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            return;
        }
        if (password === confirmPassword) {
            await handleStorePassword();
            const importType = localStorage.getItem('importType');
            console.log('Import type:', importType); // Debug log

            if (importType === 'privateKey') {
                console.log('Redirecting to privatekey import'); // Debug log
                router.push('/account/privatekey/import');
            } if (importType === 'json') {
                console.log('Redirecting to restore-json'); // Debug log
                router.push('/account/restore-json');
            } else {
                console.log('Redirecting to new-did'); // Debug log
                router.push('/account/new-did');
            }
        } else {
            setPasswordError("Passwords do not match");
        }
    };

    const handleAcceptTerms = () => {
        setIsModalOpen(false);
        // You can add additional logic here if needed
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const isFormValid = () => {
        return (
            password.length >= 8 &&
            password === confirmPassword &&
            understoodPassword &&
            !passwordError
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex items-center justify-center px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-4xl w-full space-y-8 bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/2 bg-indigo-700 p-8 text-white">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-3xl font-extrabold mb-6">Secure Your Wallet</h2>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <ShieldCheckIcon className="h-6 w-6 text-indigo-300" />
                                    <p>Choose a strong, unique password</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <LockClosedIcon className="h-6 w-6 text-indigo-300" />
                                    <p>Your wallet locks after 15 minutes of inactivity</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    <div className="md:w-1/2 p-8">
                        <motion.form
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <p>Passwords should be at least 8 characters in length, including letters and numbers</p>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={password}
                                        placeholder="Enter Password"
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                        onClick={toggleShowPassword}
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" aria-hidden="true" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={confirmPassword}
                                        placeholder="Confirm Password"
                                        onChange={handleConfirmPasswordChange}
                                        required
                                    />
                                </div>
                                {passwordError && (
                                    <p className="mt-2 text-sm text-red-600" id="password-error">
                                        {passwordError}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="understoodPassword"
                                    checked={understoodPassword}
                                    onChange={(e) => setUnderstoodPassword(e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="understoodPassword" className="ml-2 block text-sm text-gray-900">
                                    I understand that Fiatsend cannot recover the password.
                                    <a href="#" className="text-indigo-600 hover:text-indigo-500 inline-flex items-center">
                                        Learn more
                                        <InformationCircleIcon className="h-4 w-4 ml-1" />
                                    </a>
                                </label>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isFormValid()
                                        ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    disabled={!isFormValid()}
                                >
                                    Continue
                                </button>
                            </div>
                        </motion.form>
                    </div>

                </div>
            </div>
            <TermsConditionsModal isOpen={isModalOpen}
                onClose={() => router.push('/')} // Navigate back if user doesn't accept
                onAccept={handleAcceptTerms} />
        </motion.div>
    );
};

export default ConfirmPasswordForm;
