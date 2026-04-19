'use client';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/auth';
import Link from 'next/link';

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
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Hồ Sơ Bệnh Nhân</h1>
                    <p className="text-gray-500 font-medium">Quản lý thông tin y tế của người thân.</p>
                </div>
                <Link href="/portal/patients/create" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all flex items-center gap-2 shrink-0">
                    <span>+</span> Thêm Hồ Sơ Mới
                </Link>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-x-auto">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500 font-medium">Đang tải danh sách...</div>
                ) : records.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có hồ sơ nào</h3>
                        <p className="text-gray-500 mb-6">Bạn chưa tạo hồ sơ y tế nào cho người thân.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-100">
                                <th className="p-4 pl-6">Họ và Tên</th>
                                <th className="p-4">Nhóm Máu</th>
                                <th className="p-4">Tình trạng dữ liệu</th>
                                <th className="p-4 text-center">Thiết bị</th>
                                <th className="p-4 text-center">Lần SOS</th>
                                <th className="p-4 pr-6 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {records.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 pl-6 font-bold text-gray-900">{r.patientName}</td>
                                    <td className="p-4">
                                        <span className="text-gray-600 font-medium font-mono bg-gray-50 rounded border border-gray-200 px-2 py-1 inline-block">
                                            {r.bloodType.replace('_POSITIVE', '+').replace('_NEGATIVE', '-')}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.dataFreshnessStatus === 'FRESH' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {r.dataFreshnessStatus === 'FRESH' ? 'Đã xác nhận (Mới)' : 'Cần xác nhận'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500 font-bold text-center">{r._count?.devices || 0}</td>
                                    <td className="p-4 text-gray-500 font-bold text-center">{r._count?.emergencyLogs || 0}</td>
                                    <td className="p-4 pr-6 text-right">
                                        <Link href={`/portal/patients/${r.id}`} className="px-3 py-1.5 bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 rounded-lg transition-colors">Chi tiết</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
