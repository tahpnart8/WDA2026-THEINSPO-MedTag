'use client';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/auth';

export default function EmergencyLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
                const res = await fetchWithAuth(`${API_URL}/portal/emergency-logs`);
                if (res.ok) {
                    setLogs(await res.json());
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className="animate-in fade-in duration-500 pb-12">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Lịch Sử SOS</h1>
            <p className="text-gray-500 font-medium mb-8">Theo dõi các lần kích hoạt thiết bị khẩn cấp.</p>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 p-6 bg-gray-50/50">Lịch sử sự cố</h2>
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500 font-medium">Đang tải lịch sử...</div>
                ) : logs.length === 0 ? (
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                        <div className="text-6xl mb-4 opacity-70">📋</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">An toàn tuyệt đối!</h3>
                        <p className="text-gray-500">Chưa có sự cố cấp cứu nào xảy ra.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-100">
                                    <th className="p-4 pl-6 text-center">Trạng Thái</th>
                                    <th className="p-4">Bệnh Nhân</th>
                                    <th className="p-4">Thiết Bị</th>
                                    <th className="p-4">Tọa Độ GPX</th>
                                    <th className="p-4 pr-6 text-right">Thời Gian</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.map(log => (
                                    <tr key={log.id} className={`hover:bg-gray-50 transition-colors ${log.status === 'TRIGGERED' ? 'bg-red-50/20' : ''}`}>
                                        <td className="p-4 pl-6 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${log.status === 'TRIGGERED' ? 'bg-red-100 text-red-700' :
                                                    log.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-gray-900">{log.medicalRecord?.patientName}</td>
                                        <td className="p-4"><span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm text-gray-700 font-medium">{log.device?.shortId || '---'}</span></td>
                                        <td className="p-4">
                                            {log.latitude && log.longitude ? (
                                                <a href={`https://maps.google.com/?q=${log.latitude},${log.longitude}`} target="_blank" className="text-blue-600 font-bold hover:underline flex items-center gap-1 w-max">
                                                    📍 {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 italic text-sm">Không thể xác định</span>
                                            )}
                                        </td>
                                        <td className="p-4 pr-6 text-right text-sm text-gray-500 font-medium">
                                            {new Date(log.createdAt).toLocaleString('vi-VN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
