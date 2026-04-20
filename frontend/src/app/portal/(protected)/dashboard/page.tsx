'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/auth';
import Link from 'next/link';
import { Users, Smartphone, Siren, Plus, Link2 } from 'lucide-react';

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
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-800 mb-1">Xin chào, {user?.fullName}! 👋</h1>
                <p className="text-slate-500 font-medium text-sm">Tổng quan Guardian Dashboard</p>
            </div>

            <div className="flex flex-col gap-4 mb-8">
                <div className="bg-white p-5 rounded-[2rem] border border-blue-50 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                        <Users size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold text-[10px] mb-0.5 uppercase tracking-widest">Hồ sơ y tế</p>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{isLoading ? '-' : stats.totalRecords}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-[2rem] border border-emerald-50 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                        <Smartphone size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold text-[10px] mb-0.5 uppercase tracking-widest">Thiết bị liên kết</p>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{isLoading ? '-' : stats.totalDevices}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-[2rem] border border-red-50 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
                        <Siren size={28} strokeWidth={2.5} className="animate-pulse" />
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold text-[10px] mb-0.5 uppercase tracking-widest">Sự cố khẩn cấp (SOS)</p>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{isLoading ? '-' : stats.totalSOS}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-blue-50 shadow-sm p-6 mb-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Thao tác nhanh</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/portal/patients/create" className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:bg-blue-700 transition active:scale-[0.98]">
                        <Plus size={20} strokeWidth={2.5} /> Thêm Hồ Sơ Mới
                    </Link>
                    <Link href="/portal/devices" className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-50 text-slate-700 font-bold rounded-2xl hover:bg-slate-100 transition active:scale-[0.98]">
                        <Link2 size={20} strokeWidth={2.5} /> Ghép Thiết Bị
                    </Link>
                </div>
            </div>
        </div>
    );
}
