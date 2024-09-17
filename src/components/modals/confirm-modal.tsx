import React, { useState } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false, false]);

    const handleCheckboxChange = (index: number) => {
        const newCheckedItems = [...checkedItems];
        newCheckedItems[index] = !newCheckedItems[index];
        setCheckedItems(newCheckedItems);
    };

    const allChecked = checkedItems.every(item => item);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Keep Your Did Safe</h2>
                <p className="mb-4">Tap on all checkboxes to confirm you understand the importance of your portable DID:</p>
                <div className="space-y-2 mb-6">
                    {[
                        "Fiatsend doesn't keep any copy of your DID and other backup methods such as JSON file or private key.",
                        "Fiatsend can't help you recover your account once your DID JSON file, or private key is lost.",
                        "It is recommended that you store your DID in a secure offline location.",
                        "You are NOT recommended to expose it on a public digital device."
                    ].map((text, index) => (
                        <label key={index} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={checkedItems[index]}
                                onChange={() => handleCheckboxChange(index)}
                                className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                            />
                            <span className="text-sm">{text}</span>
                        </label>
                    ))}
                </div>
                <button
                    onClick={onConfirm}
                    disabled={!allChecked}
                    className={`w-full py-2 px-4 rounded ${allChecked ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default ConfirmationModal;
