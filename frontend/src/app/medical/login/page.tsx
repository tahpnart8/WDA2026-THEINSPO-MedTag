'use client';
import { useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Stethoscope, Lightbulb, ArrowLeft } from 'lucide-react';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Sai tài khoản hoặc mật khẩu');
            }

            if (data.user.role !== 'DOCTOR' && data.user.role !== 'ADMIN') {
                throw new Error('Tài khoản này không có quyền truy cập Cổng Y tế Đặc quyền.');
            }

            login(data.access_token, data.user);

            const redirectParams = searchParams.get('redirect');
            if (redirectParams) {
                router.push(redirectParams);
            } else {
                router.push('/'); // Fallback if no redirect given
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-2">
                    ⚠️ {error}
                </div>
            )}
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 pl-1">Định danh Bác Sĩ (Email)</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300" placeholder="bacsi@medtag.vn" />
            </div>
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 pl-1">Mật Khẩu Y Tế</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-black tracking-widest uppercase text-sm py-4 rounded-2xl hover:bg-blue-700 transition-all transform active:scale-[0.98] shadow-[0_8px_20px_rgb(37,99,235,0.3)] mt-4 relative overflow-hidden">
                <span className={`transition-opacity flex justify-center gap-2 items-center ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                    <Stethoscope size={18} /> KÍCH HOẠT PHIÊN LÀM VIỆC
                </span>
                {isLoading && (
                    <span className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
                    </span>
                )}
            </button>
        </form>
    );
}

export default function DoctorLoginPage() {
    return (
        <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-white overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-gradient-to-br from-blue-600 to-sky-500 px-8 py-10 text-center relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 opacity-10">
                        <Stethoscope size={200} />
                    </div>
                    <div className="w-20 h-20 bg-white rounded-3xl mx-auto flex items-center justify-center mb-5 border border-white/30 shadow-lg overflow-hidden">
                        <img src="/logo.png" alt="MedTag Logo" className="w-full h-full object-contain p-1" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tighter">
                        <span className="text-white">Med</span>
                        <span className="text-yellow-300">Tag</span> <span className="text-white/80">Pro</span>
                    </h1>
                    <p className="text-blue-100 font-bold text-xs uppercase tracking-widest">Cổng Y Tế Đặc Quyền</p>
                </div>

                <div className="p-8 pb-10">
                    <div className="bg-amber-50 text-amber-700 p-4 rounded-[1.5rem] text-[13px] font-bold mb-8 border border-amber-100 flex items-start gap-4">
                        <div className="bg-amber-100 p-1.5 rounded-lg shrink-0">
                            <Lightbulb size={20} className="text-amber-600" />
                        </div>
                        <p className="leading-snug">Trong phiên bản MVP hiện tại, vui lòng đăng nhập bằng mã số hoặc email do bệnh viện cấp phép.</p>
                    </div>

                    <Suspense fallback={<div className="text-center p-4">Đang tải...</div>}>
                        <LoginForm />
                    </Suspense>

                    <div className="mt-8 pt-6 border-t border-slate-50 text-center text-xs text-slate-400 font-bold">
                        Tích hợp Cổng SSO Bộ Y Tế & VNeID sẽ ra mắt trong V2.
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center text-slate-500 font-bold text-xs uppercase tracking-widest">
                <Link href="/" className="inline-flex gap-2 items-center hover:text-slate-700 transition">
                    <ArrowLeft size={16} /> VỀ TRANG CHỦ MEDTAG
                </Link>
            </div>
        </div>
    );
}
