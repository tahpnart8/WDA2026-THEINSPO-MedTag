'use client';
import { Search, ShieldCheck } from 'lucide-react';

export default function SearchLoading() {
    return (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center px-6 overflow-hidden">
            {/* Soft Ambient Background */}
            <div className="absolute inset-0 opacity-[0.04]">
                <div className="absolute top-[20%] left-[15%] w-64 h-64 rounded-full bg-blue-600 blur-[80px] animate-pulse"></div>
                <div className="absolute bottom-[20%] right-[15%] w-64 h-64 rounded-full bg-emerald-600 blur-[80px] animate-pulse [animation-delay:1s]"></div>
            </div>

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center transition-all duration-700 animate-in fade-in">
                <div className="w-24 h-24 bg-white rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.08)] flex items-center justify-center mb-8 relative border border-slate-50">
                    <div className="absolute inset-0 rounded-[2rem] border-2 border-blue-500 border-t-transparent animate-spin p-1"></div>
                    <Search size={40} className="text-blue-500" strokeWidth={2.5} />
                </div>

                <div className="text-center">
                    <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tighter uppercase">
                        <span className="text-yellow-400">Med</span>
                        <span className="text-blue-600">Tag</span>
                    </h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] mb-8">System Validation</p>

                    <div className="bg-slate-50/80 backdrop-blur-md border border-slate-100 py-3 px-6 rounded-2xl flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Đang tra cứu dữ liệu...</span>
                    </div>
                </div>

                <div className="absolute bottom-[-100px] flex gap-1 opacity-20">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-1 h-3 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
