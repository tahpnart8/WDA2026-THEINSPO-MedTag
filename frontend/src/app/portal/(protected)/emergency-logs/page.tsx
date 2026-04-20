'use client';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/auth';
import { FileWarning, MapPin, MapPinned, Info } from 'lucide-react';

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
            <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-800 mb-1">SOS Lịch Sử</h1>
                <p className="text-slate-500 font-medium text-sm">Nhật ký kích hoạt khẩn cấp MedTag.</p>
            </div>

            {isLoading ? (
                <div className="bg-white rounded-[2rem] border border-blue-50 p-8 text-center text-slate-400 font-bold">Đang tải lịch sử...</div>
            ) : logs.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-blue-50 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-20 h-20 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center mb-6">
                        <FileWarning size={40} className="text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">Quá An Toàn!</h3>
                    <p className="text-slate-500 text-sm">Chưa có sự cố SOS nào xảy ra với người thân của bạn.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {logs.map(log => (
                        <div key={log.id} className={`bg-white rounded-[2rem] border ${log.status === 'TRIGGERED' ? 'border-red-100 shadow-[0_8px_30px_rgba(239,68,68,0.1)]' : 'border-slate-100 shadow-sm'} p-5 flex flex-col gap-3 relative overflow-hidden`}>
                            {log.status === 'TRIGGERED' && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>}

                            <div className="pl-2 flex justify-between items-start">
                                <div>
                                    <span className={`inline-block px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest mb-2 ${log.status === 'TRIGGERED' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                        {log.status === 'TRIGGERED' ? 'ĐANG CẤP CỨU MỚI' : 'ĐÃ ĐÓNG'}
                                    </span>
                                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{log.medicalRecord?.patientName}</h3>
                                    <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">{new Date(log.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                                <div className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 flex items-center justify-center">
                                    <span className="font-mono text-xs font-bold text-slate-600 tracking-wider">#{log.device?.shortId || 'WEB'}</span>
                                </div>
                            </div>

                            <div className="pl-2 mt-2 pt-3 border-t border-slate-50">
                                {log.latitude && log.longitude ? (
                                    <a href={`https://maps.google.com/?q=${log.latitude},${log.longitude}`} target="_blank" className="flex items-center gap-2 bg-blue-50 text-blue-600 font-bold px-4 py-3 rounded-xl hover:bg-blue-100 transition-colors w-full justify-center shadow-sm">
                                        <MapPinned size={18} /> Bản Đồ Cứu Hộ
                                    </a>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 bg-slate-50 text-slate-400 font-bold px-4 py-3 rounded-xl w-full text-sm border border-slate-100">
                                        <MapPin size={16} /> Không ghi nhận tọa độ
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
