'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: '', email: '', password: '', phoneNumber: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role: 'GUARDIAN' })
            });

            const data = await res.json();

            if (!res.ok) {
                const errMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
                throw new Error(errMsg || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
            }

            login(data.token, data.user);
            router.push('/portal/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12 fill-mode-both animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-200 shadow-xl relative z-10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black mb-4 mx-auto shadow-lg shadow-blue-600/30">
                        ✚
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">Đăng Ký Tài Khoản</h2>
                    <p className="text-gray-500 font-medium">Bắt đầu quản lý hồ sơ y tế người thân</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                        <input
                            type="text" required
                            value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                            placeholder="Nguyễn Văn A"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                        <input
                            type="email" required
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                            placeholder="email@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại <span className="text-gray-400 font-normal">(Tùy chọn)</span></label>
                        <input
                            type="tel"
                            value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                            placeholder="0912345678"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu</label>
                        <input
                            type="password" required minLength={6}
                            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                            placeholder="Tối thiểu 6 ký tự"
                        />
                    </div>

                    <button
                        type="submit" disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {isLoading ? 'Đang tạo...' : 'ĐĂNG KÝ'}
                    </button>
                </form>

                <div className="mt-8 text-center text-gray-500 font-medium pb-2 border-t border-gray-100 pt-6">
                    Đã có tài khoản?{' '}
                    <Link href="/portal/login" className="text-blue-600 hover:text-blue-700 font-bold ml-1 hover:underline">
                        Đăng nhập
                    </Link>
                </div>
            </div>
            <div className="mt-8 text-center">
                <Link href="/" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                    ← Quay về trang chủ
                </Link>
            </div>
        </div>
    );
}
