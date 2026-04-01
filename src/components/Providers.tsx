import { AuthProvider } from "@/context/AuthContext";
import { ModalProvider } from "@/context/ModalContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import HelpCenter from "./layout/HelpCenter";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider>
                <ModalProvider>
                    {children}
                    <Toaster position="top-right" richColors theme="light" />
                    <HelpCenter />
                </ModalProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}
