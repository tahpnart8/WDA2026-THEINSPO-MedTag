'use client';
import { useState, useRef, useEffect } from 'react';

interface AntiSpamGateProps {
    onVerified: () => void;
}

export default function AntiSpamGate({ onVerified }: AntiSpamGateProps) {
    const [progress, setProgress] = useState(0);
    const [isPressing, setIsPressing] = useState(false);
    const pressTimer = useRef<NodeJS.Timeout | null>(null);
    const HOLD_TIME = 2000;
    const INTERVAL = 50;

    useEffect(() => {
        if (isPressing) {
            pressTimer.current = setInterval(() => {
                setProgress((prev) => {
                    const next = prev + (INTERVAL / HOLD_TIME) * 100;
                    if (next >= 100) {
                        clearInterval(pressTimer.current!);
                        setIsPressing(false);
                        onVerified();
                        return 100;
                    }
                    return next;
                });
            }, INTERVAL);
        } else {
            if (pressTimer.current) clearInterval(pressTimer.current);
            setProgress(0);
        }

        return () => {
            if (pressTimer.current) clearInterval(pressTimer.current);
        };
    }, [isPressing, onVerified]);

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center px-6 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-8 p-6 bg-blue-50 rounded-full">
                <span className="text-6xl block transform transition-transform">
                    {progress >= 100 ? '🔓' : '🔒'}
                </span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">HỆ THỐNG Y TẾ MEDTAG</h1>
            <p className="text-xl text-gray-600 mb-12 font-medium">Bảo vệ quyền riêng tư bệnh nhân.<br />Nhấn và giữ nút bên dưới để xác nhận bạn là một con người thật.</p>

            <button
                type="button"
                className="relative w-48 h-48 rounded-full bg-gray-100 flex items-center justify-center shadow-inner active:scale-95 transition-transform select-none touch-none"
                onMouseDown={() => setIsPressing(true)}
                onMouseUp={() => setIsPressing(false)}
                onMouseLeave={() => setIsPressing(false)}
                onTouchStart={() => setIsPressing(true)}
                onTouchEnd={() => setIsPressing(false)}
                aria-label="Nhấn và giữ để mở khóa"
            >
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                    <circle
                        cx="50" cy="50" r="45"
                        fill="none" stroke="#e5e7eb" strokeWidth="10"
                    />
                    <circle
                        cx="50" cy="50" r="45"
                        fill="none" stroke="#3b82f6" strokeWidth="10"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * progress) / 100}
                        className="transition-all duration-75"
                    />
                </svg>
                <span className="font-bold text-gray-500 text-lg z-10 pointer-events-none uppercase tracking-widest text-center px-4 leading-tight">
                    Nhấn & Giữ<br />2 Giây
                </span>
            </button>
        </div>
    );
}
