import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './use-app-dispatch';
import { fetchOfferings } from '@/lib/offering-slice';
import { RootState } from '@/lib/store';

export const useOfferings = (from: string = 'GHS', to: string = 'USDC') => {
    const dispatch = useAppDispatch();
    const { matchedOfferings, status, error } = useAppSelector((state: RootState) => state.offering);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!isInitialized) {
            dispatch(fetchOfferings({ from, to }));
            setIsInitialized(true);
        }
    }, [dispatch, isInitialized, from, to]);

    return { matchedOfferings, status, error };
};