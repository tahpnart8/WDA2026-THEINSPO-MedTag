'use client';
import { useState } from 'react';
import AntiSpamGate from '@/components/emergency/AntiSpamGate';

export default function ClientGateWrapper({ children }: { children: React.ReactNode }) {
    const [isVerified, setIsVerified] = useState(false);

    if (!isVerified) {
        return <AntiSpamGate onVerified={() => setIsVerified(true)} />;
    }

    return <div className="animate-in fade-in fill-mode-both duration-500">{children}</div>;
}
