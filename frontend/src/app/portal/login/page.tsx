'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { HeartPulse, ArrowLeft } from 'lucide-react';

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

            login(data.access_token, data.user);
            router.push('/portal/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50/50 px-4 py-8 fill-mode-both animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-white p-8 rounded-[2rem] border border-blue-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center mb-6 mx-auto shadow-sm border border-blue-100/50 overflow-hidden">
                        <img src="/logo.png" alt="MedTag Logo" className="w-full h-full object-contain p-1" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tighter">Đăng Nhập</h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Hệ thống Guardian</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-semibold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium text-slate-700"
                            placeholder="nguoithan@medtag.vn"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 pl-1">Mật Khẩu</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium text-slate-700"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black tracking-widest text-sm py-4 rounded-2xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] uppercase active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 border border-blue-500"
                    >
                        {isLoading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}
                    </button>
                </form>

                <div className="mt-8 text-center text-slate-400 font-medium pb-2 border-t border-slate-50 pt-6 text-sm">
                    Chưa có tài khoản?{' '}
                    <Link href="/portal/register" className="text-blue-600 hover:text-blue-700 font-bold ml-1 transition-colors">
                        Đăng ký ngay
                    </Link>
                </div>
            </div>
            <div className="mt-8 text-center">
                <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                    <ArrowLeft size={16} /> Quay về trang chủ
                </Link>
            </div>
        </div>
    );
}
