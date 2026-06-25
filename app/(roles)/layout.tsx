'use client';

import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

export const dynamic = 'force-dynamic';

export default function RoleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Default to true on desktop, false on mobile (determined by viewport width)
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mounted, setMounted] = useState(false);
    const { user } = useAuthStore();

    // Prevent hydration mismatch by waiting for client-side mount
    useEffect(() => {
        setMounted(true);

        // Close sidebar on mobile by default
        const checkMobile = () => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Show loading screen during hydration to prevent flickering
    if (!mounted) {
        return <LoadingScreen />;
    }
    if (user?.role === 'ADMIN' || user?.role === 'AGENT') {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto" style={{ backgroundColor: "#f7f8f9" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
