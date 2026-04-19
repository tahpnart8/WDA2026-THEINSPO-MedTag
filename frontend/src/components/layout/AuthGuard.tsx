'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Role } from '@/types/user';

interface AuthGuardProps {
    children: React.ReactNode;
    requiredRole?: Role;
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.replace('/portal/login');
            } else if (requiredRole && user?.role !== requiredRole) {
                router.replace('/');
            } else {
                setIsAuthorized(true);
            }
        }
    }, [isLoading, isAuthenticated, user, requiredRole, router]);

    if (isLoading || !isAuthorized) {
        return (
            <div className="flex bg-gray-50 flex-col items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent flex items-center justify-center rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-medium text-lg animate-pulse">Đang xác thực thông tin...</p>
            </div>
        );
    }

    return <>{children}</>;
}
