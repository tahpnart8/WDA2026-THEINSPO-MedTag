import BottomNav from '@/components/portal/BottomNav';
import AuthGuard from '@/components/layout/AuthGuard';

export default function ProtectedPortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard requiredRole="GUARDIAN">
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Mobile App Header */}
                <header className="bg-slate-900 text-white h-16 flex items-center px-4 sticky top-0 z-40 shadow-md justify-between">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-black shadow-md mr-3 border border-blue-500">
                            ✚
                        </div>
                        <h1 className="text-xl font-black tracking-tighter">MedTag<span className="text-blue-400">.vn</span></h1>
                    </div>
                    <div className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 uppercase tracking-widest">
                        Portal
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
