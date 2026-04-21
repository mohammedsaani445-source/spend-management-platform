import { useState, useEffect, useRef } from 'react';

const DEFAULT_OPTIONS: IntersectionObserverInit = { threshold: 0.1 };

export function useIntersection(options: IntersectionObserverInit = DEFAULT_OPTIONS) {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const elementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const target = elementRef.current;
        if (!target || isIntersecting) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsIntersecting(true);
            }
        }, options);

        observer.observe(target);

        return () => {
            if (target) {
                observer.unobserve(target);
            }
            observer.disconnect();
        };
    }, [options, isIntersecting]);

    return [elementRef, isIntersecting] as const;
}
