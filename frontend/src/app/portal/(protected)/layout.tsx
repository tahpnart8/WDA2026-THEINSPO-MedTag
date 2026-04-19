import Sidebar from '@/components/portal/Sidebar';
import AuthGuard from '@/components/layout/AuthGuard';

export default function ProtectedPortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard requiredRole="GUARDIAN">
            <div className="min-h-screen bg-gray-50 flex">
                <Sidebar />

                {/* Mobile Header */}
                <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
                    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 md:hidden">
                        <h1 className="text-xl font-black tracking-tighter">MedTag<span className="text-blue-600">.vn</span></h1>
                    </header>

                    <main className="flex-1 overflow-y-auto p-4 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
