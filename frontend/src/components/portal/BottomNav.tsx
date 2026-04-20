'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, Smartphone, History, LogOut } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const links = [
        { name: 'Tổng quan', href: '/portal/dashboard', icon: LayoutDashboard },
        { name: 'Bệnh nhân', href: '/portal/patients', icon: Users },
        { name: 'Thiết bị', href: '/portal/devices', icon: Smartphone },
        { name: 'Lịch sử', href: '/portal/emergency-logs', icon: History },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-blue-50/50 flex justify-around items-center h-16 sm:h-20 pb-safe z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] px-2">
            {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href) || (pathname === '/portal' && link.href === '/portal/dashboard');
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-all relative ${isActive
                            ? 'text-blue-600'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        {isActive && (
                            <div className="absolute top-0 w-12 h-1 bg-blue-600 rounded-b-full"></div>
                        )}
                        <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} className={`transition-all ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(37,99,235,0.2)]' : ''}`} />
                        <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-tighter sm:tracking-widest transition-all ${isActive ? 'opacity-100' : 'opacity-60 font-bold'}`}>
                            {link.name}
                        </span>
                    </Link>
                );
            })}
            <button
                onClick={logout}
                className="flex flex-col items-center justify-center w-full h-full space-y-1.5 text-slate-400 hover:text-red-500 transition-all active:scale-95 px-2"
                title="Đăng xuất"
            >
                <LogOut size={22} strokeWidth={2} className="transition-all" />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter sm:tracking-widest opacity-60 font-bold">Thoát</span>
            </button>
        </nav>
    );
}

