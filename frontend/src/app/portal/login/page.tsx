'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Đăng nhập thất bại.');
            }

            if (data.user.role === 'DOCTOR') {
                throw new Error('Tài khoản Bác sĩ vui lòng đăng nhập qua Cổng Y Tế Đặc Quyền.');
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 fill-mode-both animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-200 shadow-xl relative z-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black mb-4 mx-auto shadow-lg shadow-blue-600/30">
                        ✚
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">Đăng Nhập</h2>
                    <p className="text-gray-500 font-medium">Hệ thống Quản lý Bệnh nhân (Guardian)</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                            placeholder="nguoithan@medtag.vn"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}
                    </button>
                </form>

                <div className="mt-8 text-center text-gray-500 font-medium pb-2 border-t border-gray-100 pt-6">
                    Chưa có tài khoản?{' '}
                    <Link href="/portal/register" className="text-blue-600 hover:text-blue-700 font-bold ml-1 hover:underline">
                        Đăng ký ngay
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
