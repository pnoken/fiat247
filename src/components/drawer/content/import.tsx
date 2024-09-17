import { XMarkIcon, KeyIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline'
import { DialogTitle } from '@headlessui/react'
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface DrawerContentProps {
    onClose: () => void;
}

const DrawerContent: React.FC<DrawerContentProps> = ({ onClose }) => {
    const router = useRouter();
    const handleImport = (type: 'privateKey' | 'json') => {
        localStorage.setItem('importType', type);
        setTimeout(() => {
            router.push('/password/create');
        }, 2000);
        onClose();
    };
    return (
        <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
            <div className="px-4 sm:px-6 py-6">
                <div className="flex items-start justify-between">
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                        Import Account
                    </DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                        <button
                            onClick={() => onClose()}
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                </div>
                <div className="mt-8 space-y-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        disabled
                        whileTap={{ scale: 0.95 }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={() => handleImport('privateKey')}
                    >
                        <KeyIcon className="h-5 w-5" />
                        Import with Private Key
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={() => handleImport('json')}
                    >
                        <DocumentArrowUpIcon className="h-5 w-5" />
                        Import from DID (JSON)
                    </motion.button>
                </div>
            </div>
        </div>
    )
}

export default DrawerContent