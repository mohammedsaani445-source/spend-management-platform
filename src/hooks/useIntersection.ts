import { useState, useEffect, useRef } from 'react';

export function useIntersection(options: IntersectionObserverInit = { threshold: 0.1 }) {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const elementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsIntersecting(true);
                // Once it has intersected, we can stop observing if we only want one-time reveal
                if (elementRef.current) {
                    observer.unobserve(elementRef.current);
                }
            }
        }, options);

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [options]);

    return [elementRef, isIntersecting] as const;
}
