'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/auth';
import AuthGuard from '@/components/layout/AuthGuard';
import { FreshnessFlag, MedicalHistory, MedicationList, Contraindications, LabResults } from '@/components/medical/MedicalComponents';
import { Stethoscope, ShieldCheck, UserCircle, Phone, LockKeyhole, SearchX, Loader2, LogOut } from 'lucide-react';

function DoctorDashboardContent({ shortId }: { shortId: string }) {
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
    const [record, setRecord] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('history');

    useEffect(() => {
        if (authLoading || !isAuthenticated) return;

        const fetchRecord = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
                const res = await fetchWithAuth(`${API_URL}/medical/${shortId}`);
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || 'Không thể tải hồ sơ bệnh án');
                }
                setRecord(await res.json());
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecord();
    }, [shortId, authLoading, isAuthenticated]);

    if (isLoading || authLoading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
                <p className="text-slate-500 font-black tracking-widest text-xs uppercase">Đang giải mã bệnh án AES-256...</p>
            </div>
        </div>;
    }

    if (error) {
        return <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center text-center">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-red-100 max-w-md w-full">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                    <SearchX size={40} />
                </div>
                <h1 className="text-2xl font-black text-slate-800 mb-2">Truy Cập Bị Từ Chối</h1>
                <p className="text-slate-500 mb-6 font-medium text-sm">{error}</p>
            </div>
        </div>;
    }

    const { publicData, decryptedMedicalData, dataFreshness } = record;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-blue-600 text-white sticky top-0 z-10 shadow-md">
                <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src="/logo.png" alt="MedTag Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="font-black tracking-tighter text-lg leading-tight uppercase">
                                <span className="text-yellow-400">Med</span>
                                <span className="text-white">Tag</span>
                            </h1>
                            <p className="text-[9px] text-blue-200 font-mono tracking-widest uppercase flex items-center gap-1">
                                <LockKeyhole size={10} /> DOCTOR PORTAL
                            </p>
                        </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-black text-white">BS. {user?.fullName}</p>
                            <p className="text-[10px] text-blue-200 uppercase font-bold tracking-widest">MÃ NV: {user?.id.split('-')[0]}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-xl flex items-center justify-center border border-red-400 font-bold text-white shadow-lg transition-all active:scale-95"
                            title="Đăng xuất"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
                <div className="mb-8">
                    <FreshnessFlag status={dataFreshness.status} date={dataFreshness.lastConfirmedAt} days={dataFreshness.daysSinceConfirmed} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-sky-300"></div>

                            <div className="text-center mt-4 mb-6">
                                <div className="w-28 h-28 bg-blue-50/50 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl border-[3px] border-white shadow-sm overflow-hidden relative">
                                    {publicData.avatarUrl ? <img src={publicData.avatarUrl} className="w-full h-full object-cover" /> : <UserCircle size={48} className="text-blue-300" strokeWidth={1} />}
                                </div>
                                <h2 className="text-2xl font-black text-slate-800">{publicData.patientName}</h2>
                                <p className="text-slate-400 mt-1 font-mono font-bold tracking-widest uppercase text-sm border border-slate-100 bg-slate-50 px-3 py-1 rounded-lg inline-block">ID: {shortId}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nhóm máu</span>
                                    <span className="font-black text-red-600 bg-red-50/50 px-3 py-1.5 rounded-lg border border-red-100 font-mono tracking-widest text-sm">{publicData.bloodType.replace('_...', '+')}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Giới tính</span>
                                    <span className="font-black text-slate-800">{publicData.gender === 'MALE' ? 'Nam' : 'Nữ'}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Độ tuổi</span>
                                    <span className="font-black text-slate-800">{publicData.dateOfBirth ? (new Date().getFullYear() - new Date(publicData.dateOfBirth).getFullYear()) + ' tuổi' : 'N/A'}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <h3 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-3 flex items-center gap-1.5">
                                    Liên hệ người nhà <ShieldCheck size={12} className="text-emerald-500" />
                                </h3>
                                <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100/50">
                                    <p className="font-black text-slate-800 tracking-tight">{publicData.emergencyContact.name}</p>
                                    <p className="text-blue-600 font-bold font-mono text-xs mt-1 flex items-center gap-1.5 pt-1">
                                        <Phone size={12} /> {publicData.emergencyContact.phone}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden min-h-[500px] flex flex-col">
                            <div className="flex overflow-x-auto hide-scrollbar bg-slate-50">
                                <button onClick={() => setActiveTab('history')} className={`px-5 py-4 font-black uppercase tracking-widest text-[10px] sm:text-xs whitespace-nowrap transition-colors flex-1 ${activeTab === 'history' ? 'border-b-[3px] border-blue-600 text-blue-700 bg-blue-50/50' : 'text-slate-400 hover:bg-slate-100 border-b-[3px] border-transparent'}`}>Tiền Sử</button>
                                <button onClick={() => setActiveTab('medications')} className={`px-5 py-4 font-black uppercase tracking-widest text-[10px] sm:text-xs whitespace-nowrap transition-colors flex-1 ${activeTab === 'medications' ? 'border-b-[3px] border-blue-600 text-blue-700 bg-blue-50/50' : 'text-slate-400 hover:bg-slate-100 border-b-[3px] border-transparent'}`}>Thuốc Dùng</button>
                                <button onClick={() => setActiveTab('lab')} className={`px-5 py-4 font-black uppercase tracking-widest text-[10px] sm:text-xs whitespace-nowrap transition-colors flex-1 ${activeTab === 'lab' ? 'border-b-[3px] border-blue-600 text-blue-700 bg-blue-50/50' : 'text-slate-400 hover:bg-slate-100 border-b-[3px] border-transparent'}`}>Xét Nghiệm</button>
                                <button onClick={() => setActiveTab('contraindications')} className={`px-5 py-4 font-black uppercase tracking-widest text-[10px] sm:text-xs whitespace-nowrap transition-colors flex-1 ${activeTab === 'contraindications' ? 'border-b-[3px] border-red-600 text-red-600 bg-red-50/50' : 'text-slate-400 hover:bg-slate-100 border-b-[3px] border-transparent'}`}>Dị Ứng</button>
                            </div>

                            <div className="p-6 sm:p-8 flex-1 bg-white">
                                {activeTab === 'history' && <MedicalHistory data={decryptedMedicalData} />}
                                {activeTab === 'medications' && <MedicationList medications={decryptedMedicalData?.medications} />}
                                {activeTab === 'lab' && <LabResults results={decryptedMedicalData?.labResults} />}
                                {activeTab === 'contraindications' && <Contraindications items={decryptedMedicalData?.contraindications} />}
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-bold text-slate-400 font-mono tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                            Encrypted log: {new Date(record.accessedAt).toLocaleTimeString('vi-VN')}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function DoctorDashboard({ params }: { params: Promise<{ shortId: string }> }) {
    const [shortId, setShortId] = useState('');
    useEffect(() => { params.then(p => setShortId(p.shortId)); }, [params]);

    if (!shortId) return null;

    return (
        <AuthGuard requiredRole="DOCTOR">
            <DoctorDashboardContent shortId={shortId} />
        </AuthGuard>
    );
}
