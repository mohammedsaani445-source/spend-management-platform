"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
    children: ReactNode;
    selector?: string;
}

/**
 * Portal component that renders its children into a different part of the DOM.
 * Useful for modals, tooltips, and overlays to avoid stacking context issues.
 */
export default function Portal({ children, selector = "body" }: PortalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    const element = document.querySelector(selector);
    if (!element) return null;

    return createPortal(children, element);
}
