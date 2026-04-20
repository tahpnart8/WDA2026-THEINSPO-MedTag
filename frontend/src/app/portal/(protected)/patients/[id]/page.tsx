'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/auth';
import Link from 'next/link';
import { Save, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditPatientPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [formData, setFormData] = useState({
        patientName: '',
        bloodType: 'UNKNOWN',
        emergencyPhone: '',
        emergencyContactName: '',
        notes: '',
        allergies: '',
        dangerousConditions: '',
        avatarUrl: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
                const res = await fetchWithAuth(`${API_URL}/portal/medical-records/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        patientName: data.patientName || '',
                        bloodType: data.bloodType || 'UNKNOWN',
                        emergencyPhone: data.emergencyPhone || '',
                        emergencyContactName: data.emergencyContactName || '',
                        notes: data.notes || '',
                        allergies: Array.isArray(data.allergies) ? data.allergies.join(', ') : '',
                        dangerousConditions: Array.isArray(data.dangerousConditions) ? data.dangerousConditions.join(', ') : '',
                        avatarUrl: data.avatarUrl || '',
                    });
                } else {
                    toast.error('Không thể tải hồ sơ');
                    router.push('/portal/patients');
                }
            } catch (e) {
                console.error(e);
                toast.error('Lỗi kết nối');
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchRecord();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const res = await fetchWithAuth(`${API_URL}/portal/medical-records/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    allergies: formData.allergies.split(',').map(s => s.trim()).filter(s => s !== ''),
                    dangerousConditions: formData.dangerousConditions.split(',').map(s => s.trim()).filter(s => s !== ''),
                }),
            });

            if (res.ok) {
                toast.success('Đã cập nhật hồ sơ');
                router.push('/portal/patients');
            } else {
                const errorData = await res.json();
                toast.error('Lỗi: ' + (errorData.message || 'Không thể lưu'));
            }
        } catch (e) {
            console.error(e);
            toast.error('Đã xảy ra lỗi hệ thống');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bạn có chắc chắn muốn xóa hồ sơ này không? Hành động này không thể hoàn tác.')) return;

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const res = await fetchWithAuth(`${API_URL}/portal/medical-records/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('Đã xóa hồ sơ');
                router.push('/portal/patients');
            } else {
                toast.error('Không thể xóa hồ sơ');
            }
        } catch (e) {
            toast.error('Lỗi hệ thống');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
                <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-bold tracking-widest text-xs uppercase">Đang tải hồ sơ...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in duration-500 pb-12">
            <div className="flex justify-between items-center mb-6">
                <Link href="/portal/patients" className="text-gray-500 hover:text-gray-900 font-bold flex items-center gap-2 transition-colors">
                    <ArrowLeft size={18} /> Quay lại
                </Link>
                <button onClick={handleDelete} className="text-red-500 hover:text-red-700 font-bold flex items-center gap-2 transition-colors text-sm">
                    <Trash2 size={16} /> Xóa hồ sơ
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden p-8">
                <h1 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    Cập Nhật Hồ Sơ
                </h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-32 h-32 bg-slate-50 rounded-full overflow-hidden border-4 border-white shadow-sm mb-4 flex items-center justify-center text-slate-300 relative inline-block">
                            {formData.avatarUrl ? (
                                <img src={formData.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-4xl font-black text-slate-200">
                                    {formData.patientName ? formData.patientName.charAt(0).toUpperCase() : 'AV'}
                                </div>
                            )}
                        </div>
                        <div className="w-full max-w-sm">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 text-center">Đường dẫn ảnh đại diện (URL)</label>
                            <input
                                type="url"
                                value={formData.avatarUrl}
                                onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                                className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-600 text-sm h-12 text-center"
                                placeholder="https://example.com/photo.jpg"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Họ Tên Bệnh Nhân *</label>
                        <input type="text" required value={formData.patientName} onChange={e => setFormData({ ...formData, patientName: e.target.value })} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-700" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nhóm Máu</label>
                        <select value={formData.bloodType} onChange={e => setFormData({ ...formData, bloodType: e.target.value })} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none hover:bg-slate-50 transition-colors cursor-pointer font-bold text-slate-700">
                            <option value="UNKNOWN">Chưa Rõ</option>
                            <option value="O_POSITIVE">O+</option>
                            <option value="O_NEGATIVE">O-</option>
                            <option value="A_POSITIVE">A+</option>
                            <option value="A_NEGATIVE">A-</option>
                            <option value="B_POSITIVE">B+</option>
                            <option value="B_NEGATIVE">B-</option>
                            <option value="AB_POSITIVE">AB+</option>
                            <option value="AB_NEGATIVE">AB-</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Liên Hệ Khẩn Cấp</label>
                            <input type="text" value={formData.emergencyContactName} onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-700" placeholder="Tên người nhà" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Số ĐT Khẩn Cấp</label>
                            <input type="tel" value={formData.emergencyPhone} onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-700" placeholder="09xxxx" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Dị Ứng (Cách nhau bằng dấu phẩy)</label>
                            <input type="text" value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: e.target.value })} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-700" placeholder="Hải sản, Đậu phộng..." />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Bệnh Lý Nguy Hiểm</label>
                            <input type="text" value={formData.dangerousConditions} onChange={e => setFormData({ ...formData, dangerousConditions: e.target.value })} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-700" placeholder="Tim mạch, Tiểu đường..." />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Ghi Chú Y Tế</label>
                        <textarea
                            rows={5}
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                            placeholder="Tiền sử bệnh, dị ứng hoặc lưu ý đặc biệt khác..."
                        />
                    </div>
                    <button type="submit" disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 mt-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                        {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                </form>
            </div>
        </div>
    );
}
