'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const links = [
        { name: 'Tổng quan', href: '/portal/dashboard', icon: '📊' },
        { name: 'Hồ sơ bệnh nhân', href: '/portal/patients', icon: '👤' },
        { name: 'Thiết bị', href: '/portal/devices', icon: '📱' },
        { name: 'Lịch sử SOS', href: '/portal/emergency-logs', icon: '📋' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 hidden md:flex">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden border border-gray-100">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-0.5" />
                </div>
                <h1 className="text-2xl font-black tracking-tighter">
                    <span className="text-blue-600">Med</span>
                    <span className="text-yellow-400">Tag</span>
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <p className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 mt-4">Menu Chính</p>
                {links.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700 font-bold'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            <span className="text-xl">{link.icon}</span>
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-3 py-2 mb-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg">
                        {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-bold transition-colors active:scale-95"
                >
                    <span>🚪</span> Đăng xuất
                </button>
            </div>
        </aside>
    );
}
