import React, { useState, useRef, useEffect, useCallback } from 'react';

interface TermsConditionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
}

const TermsConditionsModal: React.FC<TermsConditionsModalProps> = ({ isOpen, onClose, onAccept }) => {
    const [isFullyScrolled, setIsFullyScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState(0);
    const [scrollPercentage, setScrollPercentage] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    const sections = [
        { title: "Terms of Use", content: "These Terms of Use ('Agreement') set forth the general terms and conditions of your use of the Fiatsend web dashboard application ('Fiatsend Web Wallet') and any of its related products and services (collectively, 'Services')." },
        { title: "Accounts and membership", content: "If you create a wallet in the Fiatsend Application, you are responsible for maintaining the security of your wallet and you are fully responsible for all activities that occur with the wallet and any other actions taken in connection with it." },
        { title: "Privacy Policy", content: "We respect your privacy and are committed to protecting it through our compliance with this privacy policy ('Policy'). This Policy describes the types of information we may collect from you or that you may provide on the Fiatsend Application, Fiatsend.App website, and any of their related products and services, and our practices for collecting, using, maintaining, protecting, and disclosing that information." },
        { title: "Disclosure of information", content: "We do not share your information with anyone or for any reason." },
        { title: "Security Measures", content: "In the event we become aware that the security of the Services has been compromised as a result of external activity, including, but not limited to, security attacks or fraud, we reserve the right to take reasonably appropriate measures, including, but not limited to, investigation and reporting, as well as notification to and cooperation with law enforcement authorities." },
        { title: "Prohibited uses", content: "In addition to other terms as set forth in the Agreement, you are prohibited from using the Fiatsend Application and Services for any unlawful purpose, to solicit others to perform or participate in any unlawful acts, to violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances, to infringe upon or violate our intellectual property rights or the intellectual property rights of others, and more." },
        { title: "Intellectual property rights", content: "'Intellectual Property Rights' means all present and future rights conferred by statute, common law, or equity in or in relation to any copyright and related rights, trademarks, designs, patents, inventions, goodwill, and the right to sue for passing off, rights to inventions, rights to use, and all other intellectual property rights, in each case whether registered or unregistered." },
        { title: "Limitation of liability", content: "To the fullest extent permitted by applicable law, in no event will the Operator, its affiliates, directors, officers, employees, agents, suppliers, or licensors be liable to any person for any indirect, incidental, special, punitive, cover or consequential damages." },
        { title: "Changes and amendments", content: "We reserve the right to modify this Agreement or its terms related to the Fiatsend Application and Services at any time at our discretion. When we do, we will revise the updated date at the bottom of this page." },
    ];

    const handleScroll = useCallback(() => {
        if (contentRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
            const scrollableDistance = scrollHeight - clientHeight;
            const currentScrollPercentage = (scrollTop / scrollableDistance) * 100;

            setScrollPercentage(currentScrollPercentage);
            setIsFullyScrolled(currentScrollPercentage > 99);
            setActiveSection(Math.floor((scrollTop / scrollableDistance) * sections.length));
        }
    }, [sections.length]);

    useEffect(() => {
        if (contentRef.current) {
            handleScroll(); // Initial check
        }
    }, [handleScroll]);

    const handleAccept = () => {
        localStorage.setItem('termsAccepted', 'true');
        onAccept();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[80vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Terms and Conditions</h2>
                    <div className="text-sm text-gray-500">
                        Scroll progress: {Math.round(scrollPercentage)}%
                    </div>
                </div>
                <div className="flex-grow flex overflow-hidden">
                    <div className="hidden md:block w-full bg-gray-100 p-4 overflow-y-auto">
                        {sections.map((section, index) => (
                            <div
                                key={index}
                                className={`cursor-pointer p-2 rounded ${activeSection === index ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-200'}`}
                                onClick={() => {
                                    contentRef.current?.scrollTo({
                                        top: (contentRef.current.scrollHeight / sections.length) * index,
                                        behavior: 'smooth'
                                    });
                                }}
                            >
                                {section.title}
                            </div>
                        ))}
                    </div>
                    <div
                        ref={contentRef}
                        className="flex-grow p-6 overflow-y-auto"
                        onScroll={handleScroll}
                    >
                        {sections.map((section, index) => (
                            <div key={index} className="mb-6">
                                <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                                <p>{section.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-6 border-t flex justify-between items-center">
                    <div className="w-1/2 bg-gray-200 rounded-full h-2.5 md:block hidden">
                        <div
                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${scrollPercentage}%` }}
                        ></div>
                    </div>
                    <div className="space-x-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                        >
                            Decline
                        </button>
                        <button
                            onClick={handleAccept}
                            disabled={!isFullyScrolled}
                            className={`px-4 py-2 rounded transition-colors duration-300 ${isFullyScrolled
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {isFullyScrolled ? 'Accept' : 'Please read all terms'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsConditionsModal;