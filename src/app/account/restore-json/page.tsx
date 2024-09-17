'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DocumentArrowUpIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { initializeWallet } from '@/lib/wallet-slice';

const ImportPrivateKey: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const router = useRouter();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        setSelectedFile(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        setSelectedFile(file);
        console.log("file", file);
    };


    const readFileContent = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    };


    const handleSubmit = async () => {
        if (selectedFile) {
            try {
                const content = await readFileContent(selectedFile);
                localStorage.setItem('customerDid', content);
                initializeWallet();
                router.push("/home");
            } catch (error) {
                console.error('Error reading file:', error);
            }
        } else {
            console.error('No file selected');
        }

    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-800 flex items-center justify-center px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-4xl w-full space-y-8 bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    {/* Left Section - Import JSON */}
                    <div className="md:w-1/2 p-8 space-y-6">
                        <motion.h2
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-2xl font-bold text-gray-800"
                        >
                            Import from DID (JSON)
                        </motion.h2>
                        <p className="text-gray-600">Drag and drop the JSON file you exported from DID:</p>

                        {/* JSON File Upload Section */}
                        <div
                            className={`mt-4 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="space-y-1 text-center">
                                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label
                                        htmlFor="file-upload"
                                        className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                    >
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" accept='application/json' className="sr-only" onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">JSON file up to 10MB</p>
                            </div>
                        </div>

                        {selectedFile && (
                            <p className="text-sm text-gray-600">Selected file: {selectedFile.name}</p>
                        )}

                        {/* Import Account Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full flex items-center justify-center px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none transition duration-300 ease-in-out"
                            onClick={handleSubmit}
                        >
                            <ShieldCheckIcon className="w-5 h-5 mr-2" />
                            Import Account
                        </motion.button>
                    </div>

                    {/* Right Section - What is a JSON? */}
                    <div className="md:w-1/2 bg-gray-50 p-8 space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">What is a JSON?</h3>
                        <p className="text-gray-600">
                            The did.json backup file stores your decentralized identifier (DID) information securely, encrypted with your account&apos;s password. This file acts as a secondary recovery method in addition to your private key, ensuring that your identity and data remain safe and accessible.
                        </p>
                        <h4 className="text-lg font-semibold text-gray-800">How to export your JSON backup file</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            <li>When you create your account directly in the Fiatsend Wallet UI, you need to manually export the JSON file.</li>
                            <li>For step-by-step instructions on how to manually export your did.json file from various interfaces, refer to our detailed guide.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ImportPrivateKey;
