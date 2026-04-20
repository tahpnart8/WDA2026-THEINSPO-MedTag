'use client';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/auth';
import Link from 'next/link';
import { Plus, Smartphone, Siren, FolderOpen } from 'lucide-react';

export default function PatientsListPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
                const res = await fetchWithAuth(`${API_URL}/portal/medical-records`);
                if (res.ok) {
                    setRecords(await res.json());
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecords();
    }, []);

    return (
        <div className="animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 mb-1">Hồ Sơ Của Bạn</h1>
                    <p className="text-slate-500 font-medium text-sm">Quản lý bệnh án người thân.</p>
                </div>
                <Link href="/portal/patients/create" className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-2xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                    <Plus size={20} /> Thêm Hồ Sơ
                </Link>
            </div>

            {isLoading ? (
                <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2rem] text-center text-slate-400 font-bold">Đang tải dữ liệu...</div>
            ) : records.length === 0 ? (
                <div className="bg-slate-50 border border-slate-100 p-12 rounded-[2rem] text-center">
                    <div className="w-20 h-20 bg-slate-100 mx-auto rounded-full flex items-center justify-center mb-4">
                        <FolderOpen size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-1">Trống!</h3>
                    <p className="text-slate-500 text-sm">Chưa có hồ sơ nào được tạo.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {records.map(r => (
                        <div key={r.id} className="bg-white p-5 rounded-[2rem] border border-blue-50 shadow-sm flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-black text-xl text-slate-800">{r.patientName}</h3>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider font-mono">
                                            {r.bloodType.replace('_POSITIVE', '+').replace('_NEGATIVE', '-')}
                                        </span>
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${r.dataFreshnessStatus === 'FRESH' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {r.dataFreshnessStatus === 'FRESH' ? 'DỮ LIỆU TỐT' : 'CẦN CẬP NHẬT'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-6 mb-5 border-t border-slate-50 pt-4 mt-1">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Smartphone className="opacity-50" size={16} />
                                    <span className="font-bold text-sm">{r._count?.devices || 0} thẻ</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Siren className="text-red-400 opacity-80" size={16} />
                                    <span className="font-bold text-sm">{r._count?.emergencyLogs || 0} lần SOS</span>
                                </div>
                            </div>

                            <Link href={`/portal/patients/${r.id}`} className="bg-blue-50 text-blue-600 font-bold text-sm py-3 text-center rounded-xl hover:bg-blue-100 transition-colors w-full tracking-wide">
                                CẬP NHẬT GHI CHÚ
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
