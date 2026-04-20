import { useState, useRef, useEffect } from 'react';
import { Lock, LockKeyholeOpen, ShieldCheck } from 'lucide-react';

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
        if (isPressing && progress < 100) {
            pressTimer.current = setInterval(() => {
                setProgress((prev) => {
                    const next = prev + (INTERVAL / HOLD_TIME) * 100;
                    return next >= 100 ? 100 : next;
                });
            }, INTERVAL);
        } else {
            if (pressTimer.current) clearInterval(pressTimer.current);
            if (!isPressing && progress < 100) {
                setProgress(0);
            }
        }

        return () => {
            if (pressTimer.current) clearInterval(pressTimer.current);
        };
    }, [isPressing, progress]);

    useEffect(() => {
        if (progress >= 100) {
            setIsPressing(false);
            if (pressTimer.current) clearInterval(pressTimer.current);
            onVerified();
        }
    }, [progress, onVerified]);

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center px-6 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className={`mb-10 p-8 rounded-[2.5rem] transition-all duration-500 ${progress > 0 ? 'bg-blue-50 scale-110' : 'bg-slate-50'}`}>
                <div className="relative w-20 h-20 flex items-center justify-center">
                    {progress >= 100 ? (
                        <ShieldCheck size={80} className="text-emerald-500 animate-in zoom-in duration-300" strokeWidth={1.5} />
                    ) : progress > 0 ? (
                        <LockKeyholeOpen size={80} className="text-blue-500 animate-pulse" strokeWidth={1.5} />
                    ) : (
                        <Lock size={80} className="text-slate-300" strokeWidth={1.5} />
                    )}
                </div>
            </div>

            <h1 className="text-4xl font-black mb-4 tracking-tighter">
                <span className="text-blue-600">Med</span>
                <span className="text-yellow-400">Tag</span>
                <span className="text-slate-900 ml-2">EMERGENCY</span>
            </h1>

            <p className="text-lg text-slate-500 mb-12 font-bold max-w-sm leading-relaxed uppercase tracking-tight">
                Xác nhận quyền truy cập.<br />
                <span className="text-slate-400 text-sm font-medium normal-case tracking-normal">Nhấn và giữ nút bên dưới để mở khóa hồ sơ y tế.</span>
            </p>

            <button
                type="button"
                className="relative w-56 h-56 rounded-full bg-white flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.04)] border-4 border-slate-50 active:scale-95 transition-all select-none touch-none group"
                onMouseDown={() => setIsPressing(true)}
                onMouseUp={() => setIsPressing(false)}
                onMouseLeave={() => setIsPressing(false)}
                onTouchStart={() => setIsPressing(true)}
                onTouchEnd={() => setIsPressing(false)}
                aria-label="Nhấn và giữ để mở khóa"
            >
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-2" viewBox="0 0 100 100">
                    <circle
                        cx="50" cy="50" r="46"
                        fill="none" stroke="#f1f5f9" strokeWidth="6"
                    />
                    <circle
                        cx="50" cy="50" r="46"
                        fill="none" stroke={progress >= 100 ? '#10b981' : '#2563eb'} strokeWidth="6"
                        strokeDasharray="289"
                        strokeDashoffset={289 - (289 * progress) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-75"
                    />
                </svg>
                <div className="flex flex-col items-center gap-1 z-10 pointer-events-none">
                    <span className={`font-black text-2xl transition-colors duration-300 ${isPressing ? 'text-blue-600' : 'text-slate-400'}`}>
                        {Math.round(progress)}%
                    </span>
                    <span className="font-bold text-slate-300 text-[10px] uppercase tracking-[0.2em]">
                        {isPressing ? 'Đang xác thực' : 'Nhấn & Giữ'}
                    </span>
                </div>
            </button>

            <div className="absolute bottom-10 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                Protected by MedTag Security Layer
            </div>
        </div>
    );
}

