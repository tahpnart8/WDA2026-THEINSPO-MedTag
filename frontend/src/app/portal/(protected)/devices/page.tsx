'use client';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/auth';
import { SmartphoneNfc, Link as LinkIcon, Unlink, ServerOff, QrCode, Download, X, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function DevicesPage() {
    const [devices, setDevices] = useState<any[]>([]);
    const [records, setRecords] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({ shortId: '', medicalRecordId: '', label: '' });
    const [isLinking, setIsLinking] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<any | null>(null);

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

    const generateRandomId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, shortId: result });
    };

    const downloadQR = (shortId: string) => {
        const svg = document.getElementById('qr-code-svg');
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width + 40;
            canvas.height = img.height + 40;
            if (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 20, 20);
                const pngFile = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.download = `MedTag-QR-${shortId}.png`;
                downloadLink.href = `${pngFile}`;
                downloadLink.click();
            }
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    return (
        <div className="animate-in fade-in duration-500 pb-12 transition-all">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-800 mb-1">Ghép Nối Thẻ</h1>
                <p className="text-slate-500 font-medium text-sm">Gắn vòng tay, thẻ y tế vào bệnh án.</p>
            </div>

            <div className="bg-white rounded-[2rem] border border-blue-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 mb-8">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <LinkIcon size={16} /> Liên Kết Mã Mới
                </h2>
                <form onSubmit={handleLinkDevice} className="space-y-4">
                    <div className="flex gap-2">
                        <input type="text" maxLength={6} value={formData.shortId} onChange={e => setFormData({ ...formData, shortId: e.target.value.toUpperCase() })} className="flex-1 px-5 py-4 bg-slate-50 rounded-2xl border-none font-mono uppercase focus:ring-2 focus:ring-blue-100 transition-all outline-none text-slate-700 placeholder:text-slate-400" placeholder="Mã SHORT ID (Tự động nếu bỏ trống)" />
                        <button type="button" onClick={generateRandomId} className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm active:scale-95" title="Tạo mã ngẫu nhiên">
                            <RefreshCw size={20} />
                        </button>
                    </div>
                    <div>
                        <select required value={formData.medicalRecordId} onChange={e => setFormData({ ...formData, medicalRecordId: e.target.value })} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100 transition-all outline-none text-slate-700">
                            <option value="" disabled>-- Chọn Bệnh Nhân --</option>
                            {records.map(r => <option key={r.id} value={r.id}>{r.patientName}</option>)}
                        </select>
                    </div>
                    <div>
                        <input type="text" value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100 transition-all outline-none text-slate-700 placeholder:text-slate-400" placeholder="Ghi chú (Vd: Vòng đeo tay)" />
                    </div>
                    <button disabled={isLinking} type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:bg-blue-700 transition active:scale-[0.98] disabled:opacity-70 mt-4 flex items-center justify-center gap-2 tracking-wide">
                        {isLinking ? 'Đang ghép nối...' : <><SmartphoneNfc size={20} /> Ghép Nối Thiết Bị</>}
                    </button>
                </form>
            </div>

            <div className="mb-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Thiết bị đang hoạt động</h2>
            </div>

            {isLoading ? (
                <div className="bg-white rounded-[2rem] border border-blue-50 p-8 text-center text-slate-400 font-bold">Đang tải thiết bị...</div>
            ) : devices.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-blue-50 p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-2xl mb-4">
                        <ServerOff size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-1">Chưa gắn thẻ nào</h3>
                    <p className="text-slate-500 text-sm">Chưa có thiết bị nào được ghép nối.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {devices.map(d => (
                        <div key={d.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col gap-4 relative group hover:border-blue-200 transition-all">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-[1.25rem] flex items-center justify-center shrink-0">
                                        <SmartphoneNfc size={28} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-slate-800 font-mono text-lg tracking-widest">{d.shortId}</h3>
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-tight">{d.label || 'Chưa ghi chú'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedDevice(d)} className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                    <QrCode size={20} />
                                </button>
                            </div>

                            <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sở hữu</span>
                                <span className="font-bold text-sm text-slate-700">{d.medicalRecord?.patientName}</span>
                            </div>

                            <button onClick={() => handleUnlink(d.id, d.shortId)} className="flex items-center justify-center gap-2 py-3 text-red-400 hover:text-red-600 font-bold rounded-xl transition-colors shrink-0 text-xs">
                                <Unlink size={16} /> Hủy kết nối
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* QR Code Modal */}
            {selectedDevice && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedDevice(null)}></div>
                    <div className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <div className="p-8 pb-4 text-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <QrCode size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-1">Mã QR Thiết Bị</h3>
                            <p className="text-slate-400 text-sm font-medium mb-8">Dùng để dán lên vòng tay hoặc thẻ y tế</p>

                            <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 mb-8 inline-block shadow-inner">
                                <QRCodeSVG
                                    id="qr-code-svg"
                                    value={selectedDevice.qrCode || `https://medtag.vercel.app/e/${selectedDevice.shortId}`}
                                    size={180}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl mb-8">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">SHORT ID</p>
                                <p className="text-2xl font-black text-slate-800 tracking-[0.2em]">{selectedDevice.shortId}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => downloadQR(selectedDevice.shortId)} className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-bold rounded-2xl transition hover:bg-blue-700 active:scale-95 text-sm">
                                    <Download size={18} /> Tải Ảnh
                                </button>
                                <button onClick={() => setSelectedDevice(null)} className="flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl transition hover:bg-slate-200 active:scale-95 text-sm">
                                    Đóng
                                </button>
                            </div>
                        </div>
                        <button onClick={() => setSelectedDevice(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={20} className="stroke-[3]" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
