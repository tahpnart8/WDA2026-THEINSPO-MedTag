'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartPulse, Settings } from 'lucide-react';
import SearchLoading from '@/components/emergency/SearchLoading';

export default function LandingPage() {
  const [shortId, setShortId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (shortId.length === 6) {
      setIsSearching(true);
      setTimeout(() => {
        router.push(`/e/${shortId.toUpperCase()}`);
      }, 1500);
    }
  };

  if (isSearching) {
    return <SearchLoading />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-500">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white z-10 text-center animate-in slide-in-from-bottom-8 duration-700">
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-600/10 rotate-3 transition-transform hover:rotate-0 hover:scale-105 cursor-default overflow-hidden border border-gray-100">
          <img src="/logo.png" alt="MedTag Logo" className="w-full h-full object-contain p-1" />
        </div>
        <h1 className="text-4xl font-black mb-2 tracking-tighter uppercase">
          <span className="text-yellow-400">Med</span>
          <span className="text-blue-600">Tag</span>
        </h1>
        <p className="text-gray-500 font-medium text-lg leading-snug mb-8">Hệ thống thông tin y tế<br />& cấp cứu mã nguồn mở</p>

        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Mã hồ sơ (VD: TDP183)"
            value={shortId}
            onChange={(e) => setShortId(e.target.value)}
            maxLength={6}
            className="w-full text-center text-3xl font-black uppercase tracking-[0.2em] py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400 placeholder:text-lg placeholder:font-medium placeholder:tracking-normal"
          />
          <button
            type="submit"
            disabled={shortId.length !== 6}
            className="w-full bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 text-white font-bold text-xl py-4 rounded-xl shadow-lg active:scale-95 transition-all outline-none focus:ring-4 focus:ring-blue-300"
          >
            TRA CỨU HỒ SƠ
          </button>
        </form>
      </div>

      <div className="absolute bottom-8 text-center w-full z-10 flex flex-col items-center">
        <a href="/portal/login" className="text-sm font-semibold text-gray-500 hover:text-blue-700 transition-colors bg-white/70 backdrop-blur-md px-5 py-2.5 rounded-full border border-gray-200 shadow-sm active:bg-gray-100 flex items-center gap-2">
          <Settings size={16} /> Đăng nhập quản lý hồ sơ
        </a>
      </div>
    </main>
  );
}
