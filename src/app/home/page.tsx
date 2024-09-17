'use client'

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import Portfolio from '@/components/dashboard/content/portfolio';
import Exchange from '@/components/dashboard/content/exchange';
import MobileSidebar from '@/components/dashboard/mobile-sidebar';
import { TransactionList } from '@/components/dashboard/content/transactions';

const Home: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    const [activeComponent, setActiveComponent] = useState<string>('Portfolio');
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const renderContent = () => {
        switch (activeComponent) {
            case 'Portfolio':
                return <Portfolio />;
            case 'Transactions':
                return <TransactionList />;
            case 'Exchange':
                return <Exchange />;
            default:
                return <Portfolio />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            {/* Main Content Area */}
            <div className="flex-1">
                {renderContent()}
            </div>

            {/* Sidebar for desktop */}
            {!isMobile && (
                <Sidebar
                    setActiveComponent={setActiveComponent}
                />
            )}

            {/* Mobile bottom bar */}
            {isMobile && (
                <MobileSidebar
                    setActiveComponent={setActiveComponent}
                    activeComponent={activeComponent}
                />
            )}
        </div>
    );
};

export default Home;
