'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/auth';
import Link from 'next/link';

export default function CreatePatientPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        patientName: '',
        bloodType: 'UNKNOWN',
        emergencyPhone: '',
        emergencyContactName: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const res = await fetchWithAuth(`${API_URL}/portal/medical-records`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/portal/patients');
            } else {
                const errorData = await res.json();
                const actualError = errorData.error?.message || errorData.error || errorData.message;
                const errMsg = Array.isArray(actualError) ? actualError.join(', ') : actualError;
                alert('Lỗi: ' + (errMsg || 'Lỗi không xác định. Mã trạng thái: ' + res.status));
            }
        } catch (e) {
            console.error(e);
            alert('Đã xảy ra lỗi hệ thống.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in duration-500 pb-12">
            <Link href="/portal/patients" className="text-gray-500 hover:text-gray-900 font-bold mb-6 inline-block transition-colors">← Quay lại danh sách</Link>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-8">
                <h1 className="text-2xl font-black text-gray-900 mb-6">Tạo Hồ Sơ Mới</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Họ Tên Bệnh Nhân *</label>
                        <input type="text" required value={formData.patientName} onChange={e => setFormData({ ...formData, patientName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400" placeholder="Tên bệnh nhân/người cao tuổi" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nhóm Máu</label>
                        <select value={formData.bloodType} onChange={e => setFormData({ ...formData, bloodType: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none hover:bg-gray-50 transition-colors cursor-pointer">
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
                            <label className="block text-sm font-bold text-gray-700 mb-2">Người Liên Hệ Khẩn Cấp</label>
                            <input type="text" value={formData.emergencyContactName} onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" placeholder="Tên người nhà" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Số ĐT Khẩn Cấp</label>
                            <input type="tel" value={formData.emergencyPhone} onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" placeholder="09xxxx" />
                        </div>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 mt-4 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                        {isLoading ? 'Đang lưu...' : 'Thêm hồ sơ'}
                    </button>
                </form>
            </div>
        </div>
    );
}
