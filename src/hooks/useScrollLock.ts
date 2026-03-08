"use client";

import { useEffect } from 'react';

/**
 * Hook to lock body scroll when a modal/overlay is open.
 * Adds a class to the body and removes it on unmount.
 */
export const useScrollLock = (isLocked: boolean) => {
    useEffect(() => {
        if (isLocked) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }

        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [isLocked]);
};
