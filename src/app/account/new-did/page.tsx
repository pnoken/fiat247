'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ConfirmationModal from '@/components/modals/confirm-modal';
import { useRouter } from 'next/navigation';
import CodeBlock from '@/components/ui/pre/markdown';
import DownloadData from '@/components/ui/download/data-download';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/hooks/use-app-dispatch';
import { createNewWallet } from '@/lib/wallet-slice';

const NewSeedPhrase: React.FC = () => {
    const { customerDid } = useAppSelector((state) => state.wallet);
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dispatch = useAppDispatch();

    const handleIsSaved = () => {
        router.push("/create-done");
    };

    const recreateDidAfterRefresh = useCallback(async () => {
        try {
            dispatch(createNewWallet());
        } catch (error) {
            console.error('Failed to create new wallet:', error);
        }
    }, [dispatch]);

    useEffect(() => {
        setIsModalOpen(true);
    }, []);

    useEffect(() => {
        recreateDidAfterRefresh()
    }, [recreateDidAfterRefresh])

    const createDownloadLink = () => {
        if (!customerDid) return null;
        const blob = new Blob([JSON.stringify(customerDid, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'did.json';
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleCloseModal = () => setIsModalOpen(false);
    const handleConfirm = () => {
        console.log('User confirmed!');
        setIsModalOpen(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-4xl mx-auto">
                <motion.h1
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    className='text-3xl text-center mb-12 font-bold text-gray-800'
                >
                    Your Portable DID
                </motion.h1>
                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/2 p-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            <h2 className="text-2xl font-semibold mb-4">Secure Your Identity</h2>
                            <p className="mb-6">
                                Keep your portable DID in a safe place, and never disclose it.
                                Anyone with this information can take control of your assets.
                            </p>
                            <div className="bg-white/10 rounded-lg p-4 mb-6">
                                <CodeBlock data={customerDid} />
                            </div>
                            {customerDid && <DownloadData onDownloadClick={createDownloadLink} />}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={handleIsSaved}
                                className="w-full mt-4 px-4 py-2 text-blue-600 bg-white rounded-md hover:bg-blue-50 focus:outline-none transition duration-300 ease-in-out"
                                disabled={!customerDid}
                            >
                                I have saved it somewhere safe
                            </motion.button>
                        </div>
                        <div className="md:w-1/2 p-8">
                            <h3 className="text-2xl font-semibold mb-4 text-gray-800">What is a portable DID?</h3>
                            <p className="text-gray-600 mb-4">
                                A portable DID (Decentralized Identifier) is like a digital passport for your online identity.
                                It&apos;s a unique string of characters that represents you in the decentralized web.
                            </p>
                            <p className="text-gray-600 mb-6">
                                It&apos;s safe to use with Fiatsend wallet. Your DID is stored locally and never leaves your
                                device without your explicit permission.
                            </p>
                            <div className="flex items-center justify-center">
                                <Image
                                    src="/images/secure-doc.svg"
                                    alt="Portable DID Illustration"
                                    width={200}
                                    height={200}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <ConfirmationModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirm}
                />
            </div>
        </motion.div>
    );
};

export default NewSeedPhrase;
