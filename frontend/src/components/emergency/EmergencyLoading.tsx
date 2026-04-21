'use client';
import { useState, useEffect } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function EmergencyLoading() {
    const [statusIndex, setStatusIndex] = useState(0);
    const statuses = [
        "Đang xác thực bảo mật...",
        "Đang giải mã dữ liệu AES-256...",
        "Đang chuẩn bị hồ sơ y tế...",
        "Đã sẵn sàng hỗ trợ!"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStatusIndex((prev) => (prev < statuses.length - 1 ? prev + 1 : prev));
        }, 600);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center px-6 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600 blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400 blur-[100px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-sm">
                <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-10 flex flex-col items-center text-center">
                    <div className="relative mb-8">
                        {/* Outer Glow */}
                        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 animate-pulse"></div>

                        {/* Main Container */}
                        <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-400 rounded-3xl flex items-center justify-center shadow-xl rotate-3 animate-in zoom-in-50 duration-700">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 size={48} className="text-white/20 animate-spin" strokeWidth={3} />
                            </div>
                            <ShieldCheck size={40} className="text-white relative z-10 animate-pulse" strokeWidth={1.5} />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">MedTag Security</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-10">Advanced Emergency Response</p>

                    <div className="w-full space-y-4">
                        <div className="flex items-center justify-between px-2 mb-2">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">
                                {statuses[statusIndex]}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-400 italic">
                                {Math.min(100, (statusIndex + 1) * 25)}%
                            </span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${(statusIndex + 1) * 25}%` }}
                            >
                                <div className="w-full h-full opacity-30 bg-[length:20px_20px] bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] animate-[move-stripe_1s_linear_infinite]"></div>
                            </div>
                        </div>
                    </div>

                    <style jsx>{`
                        @keyframes move-stripe {
                            from { background-position: 0 0; }
                            to { background-position: 20px 0; }
                        }
                    `}</style>
                </div>

                <div className="mt-12 flex items-center justify-center gap-2 opacity-20">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></div>
                </div>
            </div>
        </div>
    );
}
