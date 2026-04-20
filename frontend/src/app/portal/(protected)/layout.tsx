import { HeartPulse } from 'lucide-react';
import BottomNav from '@/components/portal/BottomNav';
import AuthGuard from '@/components/layout/AuthGuard';

export default function ProtectedPortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard requiredRole="GUARDIAN">
            <div className="min-h-screen bg-blue-50/20 flex flex-col font-sans">
                {/* Mobile App Header */}
                <header className="bg-white border-b border-blue-50 h-16 flex items-center px-4 sticky top-0 z-40 shadow-sm justify-between">
                    <div className="flex items-center">
                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm mr-3 border border-blue-100/50">
                            <HeartPulse size={20} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-xl font-black tracking-tighter text-slate-800 underline decoration-blue-500/30 decoration-4 underline-offset-4">MedTag<span className="text-blue-600 italic">.vn</span></h1>
                    </div>
                    <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 uppercase tracking-widest shadow-sm">
                        Guardian
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 pb-24 max-w-3xl mx-auto w-full">
                    {children}
                </main>

                <BottomNav />
            </div>
        </AuthGuard>
    );
}
