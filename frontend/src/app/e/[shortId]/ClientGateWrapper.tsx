'use client';
import { useState, useEffect } from 'react';
import AntiSpamGate from '@/components/emergency/AntiSpamGate';
import EmergencyLoading from '@/components/emergency/EmergencyLoading';

export default function ClientGateWrapper({ children }: { children: React.ReactNode }) {
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleVerified = () => {
        setIsVerified(true);
        setIsLoading(true);
    };

    useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 2500); // Thêm 2.5 giây loading tinh tế
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    if (!isVerified) {
        return <AntiSpamGate onVerified={handleVerified} />;
    }

    if (isLoading) {
        return <EmergencyLoading />;
    }

    return <div className="animate-in fade-in fill-mode-both duration-700">{children}</div>;
}
