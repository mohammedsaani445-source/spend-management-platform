import { AuthProvider } from "@/context/AuthContext";
import { ModalProvider } from "@/context/ModalContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ReactNode } from "react";
import HelpCenter from "./layout/HelpCenter";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider>
                <ModalProvider>
                    {children}
                    <HelpCenter />
                </ModalProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}
