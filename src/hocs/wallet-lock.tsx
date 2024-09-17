import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { lockWallet } from '@/lib/wallet-slice';
import { RootState } from '@/lib/store';
import { useLocalStorage } from '@/hooks/use-local-storage';

const LOCK_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export const withWalletLock = (WrappedComponent: React.ComponentType) => {
    const WithWalletLock = (props: any) => {
        const router = useRouter();
        const dispatch = useDispatch();
        const isLocked = useSelector((state: RootState) => state.wallet.isLocked);
        const [lastActivity,] = useLocalStorage("lastActivity", "")

        useEffect(() => {
            const checkLockStatus = () => {
                lastActivity
                if (lastActivity && Date.now() - parseInt(lastActivity) > LOCK_TIMEOUT) {
                    dispatch(lockWallet());
                    localStorage.setItem('walletLocked', 'true');
                    router.push('/unlock');
                }
            };

            const activityHandler = () => {
                localStorage.setItem('lastActivity', Date.now().toString());
            };

            checkLockStatus();
            const interval = setInterval(checkLockStatus, 60000); // Check every minute

            window.addEventListener('mousemove', activityHandler);
            window.addEventListener('keypress', activityHandler);

            return () => {
                clearInterval(interval);
                window.removeEventListener('mousemove', activityHandler);
                window.removeEventListener('keypress', activityHandler);
            };
        }, [dispatch, router, lastActivity]);

        if (isLocked) {
            router.push('/unlock');
            return null;
        }

        return <WrappedComponent {...props} />;
    };

    WithWalletLock.displayName = `WithWalletLock(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return WithWalletLock;
};