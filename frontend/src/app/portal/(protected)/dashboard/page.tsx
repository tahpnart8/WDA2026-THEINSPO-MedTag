'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/auth';
import Link from 'next/link';

export default function DashboardOverview() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalRecords: 0, totalDevices: 0, totalSOS: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
                const res = await fetchWithAuth(`${API_URL}/portal/medical-records`);
                if (res.ok) {
                    const records = await res.json();
                    let devices = 0;
                    let sos = 0;
                    records.forEach((r: any) => {
                        devices += r._count?.devices || 0;
                        sos += r._count?.emergencyLogs || 0;
                    });
                    setStats({ totalRecords: records.length, totalDevices: devices, totalSOS: sos });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="animate-in fade-in duration-500 pb-10">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Xin chào, {user?.fullName}! 👋</h1>
            <p className="text-gray-500 font-medium mb-8">Tổng quan về hệ thống thiết bị và hồ sơ bệnh nhân.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-bold text-sm mb-1 uppercase tracking-wider">Hồ sơ y tế</p>
                        <h3 className="text-4xl font-black text-gray-900">{isLoading ? '...' : stats.totalRecords}</h3>
                    </div>
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl">👤</div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-bold text-sm mb-1 uppercase tracking-wider">Thiết bị liên kết</p>
                        <h3 className="text-4xl font-black text-gray-900">{isLoading ? '...' : stats.totalDevices}</h3>
                    </div>
                    <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-3xl">📱</div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-bold text-sm mb-1 uppercase tracking-wider">Sự cố SOS (Lịch sử)</p>
                        <h3 className="text-4xl font-black text-gray-900">{isLoading ? '...' : stats.totalSOS}</h3>
                    </div>
                    <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-3xl">🚨</div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Thao tác nhanh</h2>
                <div className="flex flex-wrap gap-4">
                    <Link href="/portal/patients/create" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition">
                        + Thêm hồ sơ mới
                    </Link>
                    <Link href="/portal/devices" className="px-6 py-3 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition">
                        🔗 Quản lý thiết bị
                    </Link>
                </div>
            </div>
        </div>
    );
}
