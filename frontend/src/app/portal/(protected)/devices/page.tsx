'use client';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/auth';

export default function DevicesPage() {
    const [devices, setDevices] = useState<any[]>([]);
    const [records, setRecords] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({ shortId: '', medicalRecordId: '', label: '' });
    const [isLinking, setIsLinking] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
                const [devRes, recRes] = await Promise.all([
                    fetchWithAuth(`${API_URL}/portal/devices`),
                    fetchWithAuth(`${API_URL}/portal/medical-records`),
                ]);
                if (devRes.ok) setDevices(await devRes.json());
                if (recRes.ok) setRecords(await recRes.json());
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLinkDevice = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLinking(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const res = await fetchWithAuth(`${API_URL}/portal/devices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                const newDevice = await res.json();
                const record = records.find(r => r.id === newDevice.medicalRecordId);
                newDevice.medicalRecord = { patientName: record?.patientName || 'N/A' };
                setDevices([newDevice, ...devices]);
                setFormData({ shortId: '', medicalRecordId: '', label: '' });
            } else {
                const err = await res.json();
                alert(err.message || 'Lỗi ghép nối thiết bị');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLinking(false);
        }
    };

    const handleUnlink = async (id: string, shortId: string) => {
        if (!confirm(`Hủy liên kết thiết bị ${shortId}?`)) return;
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const res = await fetchWithAuth(`${API_URL}/portal/devices/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setDevices(devices.filter(d => d.id !== id));
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 pb-12">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Quản Lý Thiết Bị</h1>
            <p className="text-gray-500 font-medium mb-8">Liên kết vòng tay, dây chuyền y tế vào hồ sơ bệnh nhân.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sticky top-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Ghép nối thiết bị mới</h2>
                        <form onSubmit={handleLinkDevice} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Mã Short ID (Trên mặt sau) *</label>
                                <input type="text" required maxLength={6} value={formData.shortId} onChange={e => setFormData({ ...formData, shortId: e.target.value.toUpperCase() })} className="w-full px-4 py-3 rounded-xl border border-gray-300 font-mono uppercase bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" placeholder="Vd: X7K9A2" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Chọn Hồ Sơ *</label>
                                <select required value={formData.medicalRecordId} onChange={e => setFormData({ ...formData, medicalRecordId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer outline-none">
                                    <option value="" disabled>-- Chọn Bệnh Nhân --</option>
                                    {records.map(r => <option key={r.id} value={r.id}>{r.patientName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tên (Nhãn ghi nhớ)</label>
                                <input type="text" value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" placeholder="VD: Vòng tay bố" />
                            </div>
                            <button disabled={isLinking} type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-md active:scale-[0.98] disabled:opacity-70 mt-2">
                                {isLinking ? 'Đang ghép nối...' : '🔗 Lư Thiết Bị'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 p-6 bg-gray-50/50">Danh sách thiết bị</h2>
                        {isLoading ? (
                            <div className="p-8 text-center text-gray-500 font-medium">Đang tải thiết bị...</div>
                        ) : devices.length === 0 ? (
                            <div className="p-16 flex flex-col items-center justify-center text-center">
                                <div className="text-6xl mb-4 opacity-70">📱</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có thiết bị</h3>
                                <p className="text-gray-500">Người bệnh chưa được liên kết với vòng tay MedTag nào.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {devices.map(d => (
                                    <li key={d.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl border border-gray-200">🏷️</div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-bold text-gray-900 font-mono tracking-wider text-lg bg-gray-100 px-2 rounded-md">{d.shortId}</h3>
                                                    {d.isActive ? <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Hoạt động</span> : <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Bị khóa</span>}
                                                </div>
                                                <p className="text-sm text-gray-500">Đeo trên: <span className="font-bold text-gray-800">{d.label || 'Không tên'}</span> &bull; Đích: {d.medicalRecord?.patientName}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleUnlink(d.id, d.shortId)} className="whitespace-nowrap px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors w-full sm:w-auto mt-2 sm:mt-0">Hủy Liên Kết</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
