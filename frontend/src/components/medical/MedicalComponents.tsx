import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert, Activity, Syringe, Pill, FlaskConical, AlertCircle } from 'lucide-react';

export function FreshnessFlag({ status, date, days }: { status: string, date: string, days: number }) {
    const isFresh = status === 'FRESH';
    const isStale = status === 'STALE';

    return (
        <div className={`p-4 rounded-3xl border flex items-center gap-4 font-medium shadow-sm ${isFresh ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
            isStale ? 'bg-amber-50 border-amber-100 text-amber-800' :
                'bg-red-50 border-red-100 text-red-800'
            }`}>
            <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shrink-0 ${isFresh ? 'bg-emerald-100 text-emerald-600' : isStale ? 'bg-amber-100 text-amber-500' : 'bg-red-100 text-red-500'}`}>
                {isFresh ? <CheckCircle2 size={32} /> : isStale ? <AlertTriangle size={32} /> : <ShieldAlert size={32} className="animate-pulse" />}
            </div>
            <div>
                <p className={`font-black tracking-wide text-[15px] mb-1 ${isFresh ? 'text-emerald-700' : isStale ? 'text-amber-700' : 'text-red-700'}`}>
                    {isFresh ? 'Dữ liệu y tế tin cậy tuyệt đối' : isStale ? 'Dữ liệu cần cập nhật' : 'Cảnh báo dữ liệu lỗi thời!'}
                </p>
                <p className={`text-[11px] uppercase tracking-widest font-bold ${isFresh ? 'text-emerald-600/70' : isStale ? 'text-amber-600/70' : 'text-red-600/70'}`}>
                    Xác nhận mới nhất: {new Date(date).toLocaleDateString('vi-VN')} ({days} ngày trước)
                </p>
            </div>
        </div>
    );
}

export function MedicalHistory({ data }: { data: any }) {
    if (!data) return <div className="text-slate-400 italic font-medium p-4 bg-slate-50/50 border border-slate-100 rounded-3xl text-sm">Không có dữ liệu chi tiết trong khối mã hóa. Hãy kiểm tra các mục Public Data.</div>;
    return (
        <div className="space-y-8">
            <div>
                <h3 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-xs border-b border-blue-50 pb-2 flex items-center gap-2">
                    <Activity size={16} className="text-blue-500" /> Bệnh lý cấp/mạn tính
                </h3>
                <ul className="space-y-3">
                    {(data.chronicConditions || []).length === 0 ? <li className="text-slate-400 text-sm font-medium">Chưa ghi nhận</li> : (data.chronicConditions).map((c: any, i: number) => (
                        <li key={i} className="p-4 bg-white rounded-[1.5rem] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-start flex-col gap-2">
                            <h4 className="font-black text-slate-800 text-lg">{c.name}</h4>
                            <div className="flex gap-2">
                                <span className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl text-xs font-bold font-mono border border-slate-100">Chẩn đoán: {c.diagnosedYear}</span>
                                <span className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-100">Khám tại: {c.hospital}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-xs border-b border-blue-50 pb-2 flex items-center gap-2">
                    <Syringe size={16} className="text-blue-500" /> Phẫu thuật / Thủ thuật
                </h3>
                <ul className="space-y-3">
                    {(data.surgeries || []).length === 0 ? <li className="text-slate-400 text-sm font-medium">Chưa ghi nhận</li> : (data.surgeries).map((s: any, i: number) => (
                        <li key={i} className="p-4 bg-white rounded-[1.5rem] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-start flex-col gap-2">
                            <h4 className="font-black text-slate-800 text-lg">{s.name}</h4>
                            <div className="flex gap-2">
                                <span className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl text-xs font-bold font-mono border border-slate-100">Năm: {s.year}</span>
                                <span className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-100">BS: {s.doctor}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export function MedicationList({ medications }: { medications: any[] }) {
    if (!medications || medications.length === 0) return <div className="text-slate-400 italic font-medium p-4 bg-slate-50/50 border border-slate-100 rounded-3xl text-sm">Không có dữ liệu đơn thuốc.</div>;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map((m: any, i: number) => (
                <div key={i} className="p-5 rounded-[2rem] border border-indigo-50/50 bg-indigo-50/20 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-black text-slate-800 text-lg flex items-center gap-2 tracking-tight">
                                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center shrink-0">
                                    <Pill size={16} />
                                </span>
                                {m.name}
                            </h4>
                            {m.active ? <span className="text-[9px] uppercase tracking-widest font-black px-2.5 py-1 md:py-1.5 align-middle self-center bg-emerald-100/50 text-emerald-600 rounded-lg whitespace-nowrap">Đang dùng</span> : <span className="text-[9px] uppercase font-black tracking-widest px-2.5 py-1.5 align-middle self-center bg-slate-100 text-slate-500 rounded-lg whitespace-nowrap">Ngưng</span>}
                        </div>
                        <p className="text-xs text-indigo-700 font-bold mb-3 border-l-2 border-indigo-200 pl-3 leading-snug">{m.purpose}</p>
                        <div className="bg-white rounded-xl p-3 border border-indigo-50 shadow-sm inline-block">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">CHỈ ĐỊNH LIỀU DÙNG</p>
                            <p className="text-indigo-900 font-black text-sm">{m.dosage}</p>
                        </div>
                    </div>
                    {m.doctor && <p className="text-[10px] text-slate-400 mt-5 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-300"></span> BS Kê đơn: {m.doctor}
                    </p>}
                </div>
            ))}
        </div>
    );
}

export function Contraindications({ items }: { items: any[] }) {
    if (!items || items.length === 0) return <div className="text-slate-400 italic font-medium p-4 bg-slate-50/50 border border-slate-100 rounded-3xl text-sm">Chưa có thông tin chống chỉ định y khoa.</div>;
    return (
        <div className="space-y-4">
            {items.map((item: any, i: number) => (
                <div key={i} className={`p-5 rounded-[2rem] border flex items-start gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)] ${item.severity === 'CRITICAL' ? 'bg-red-50/50 border-red-100' :
                    item.severity === 'HIGH' ? 'bg-orange-50/50 border-orange-100' :
                        'bg-amber-50/50 border-amber-100'
                    }`}>
                    <div className={`w-12 h-12 shrink-0 rounded-[1.25rem] flex items-center justify-center ${item.severity === 'CRITICAL' ? 'bg-red-100 text-red-500' :
                        item.severity === 'HIGH' ? 'bg-orange-100 text-orange-500' :
                            'bg-amber-100 text-amber-500'
                        }`}>
                        {item.severity === 'CRITICAL' ? <ShieldAlert size={24} /> : <AlertTriangle size={24} />}
                    </div>
                    <div>
                        <h4 className={`font-black text-lg mb-1 leading-tight ${item.severity === 'CRITICAL' ? 'text-red-900' : 'text-slate-800'}`}>{item.name}</h4>
                        <p className="text-sm font-medium opacity-80 mt-1.5 mb-3 text-slate-600 leading-snug">{item.reason}</p>
                        <span className={`inline-block text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg border bg-white shadow-sm ${item.severity === 'CRITICAL' ? 'text-red-600 border-red-100' : 'text-orange-600 border-orange-100'}`}>
                            Mức độ nguy hiểm: {item.severity}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function LabResults({ results }: { results: any[] }) {
    if (!results || results.length === 0) return <div className="text-slate-400 italic font-medium p-4 bg-slate-50/50 border border-slate-100 rounded-3xl text-sm">Không có dữ liệu xét nghiệm.</div>;
    return (
        <div className="space-y-6">
            {results.map((r: any, i: number) => (
                <div key={i} className="rounded-[2rem] border border-blue-50 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white">
                    <div className="bg-sky-50/50 px-5 py-4 border-b border-sky-50 flex justify-between items-center whitespace-nowrap overflow-x-auto hide-scrollbar gap-4">
                        <h4 className="font-black text-sky-900 text-sm tracking-wider flex items-center gap-3 shrink-0">
                            <span className="bg-sky-100 text-sky-600 p-2 rounded-xl border border-sky-200">
                                <FlaskConical size={18} strokeWidth={2.5} />
                            </span>
                            {r.testName}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 shrink-0">Ngày: {r.date}</span>
                    </div>
                    <div className="p-3 space-y-2 bg-slate-50/30">
                        {(r.metrics || []).map((m: any, j: number) => {
                            const isAbnormal = m.value < m.min || m.value > m.max;
                            return (
                                <div key={j} className="bg-white p-4 rounded-[1.25rem] flex items-center justify-between border border-slate-100 shadow-sm flex-wrap sm:flex-nowrap gap-3">
                                    <div className="flex-col flex shrink-0 min-w-0 max-w-[60%]">
                                        <span className="font-black text-slate-800 text-sm px-1 truncate">{m.name}</span>
                                        <span className="text-[9px] text-slate-400 font-black font-mono tracking-widest uppercase mt-1 px-1 truncate">
                                            CHUẨN: {m.min} - {m.max}
                                        </span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 font-black text-xl shrink-0 ${isAbnormal ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {m.value} <span className="text-xs font-bold opacity-60 ml-0.5 mt-1 align-bottom">{m.unit}</span>
                                        {isAbnormal && <AlertCircle size={18} strokeWidth={3} className="ml-1" />}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
