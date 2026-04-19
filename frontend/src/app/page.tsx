'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const [shortId, setShortId] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (shortId.trim().length >= 5) {
      router.push(`/e/${shortId.trim().toUpperCase()}`);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6 min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="text-center mb-10 w-full">
        <div className="text-7xl mb-4 animate-bounce">🚑</div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">MedTag</h1>
        <p className="text-lg text-gray-600 font-medium">Cổng thông tin sơ cứu khẩn cấp</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
          Nhập mã ID Khẩn cấp
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Dự phòng cho trường hợp thiết bị (vòng tay, thẻ) bị xước không thể quét mã QR. 
          ID gồm 6 ký tự in dưới mã.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <input 
            type="text" 
            value={shortId}
            onChange={(e) => setShortId(e.target.value)}
            placeholder="Ví dụ: X7K9A2"
            className="w-full text-center text-3xl font-black uppercase tracking-widest p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-300 placeholder:font-normal placeholder:tracking-normal"
            maxLength={10}
            required
          />
          <Button type="submit" size="lg" className="w-full h-14 rounded-2xl text-xl" disabled={shortId.length < 5}>
            TRUY XUẤT HỒ SƠ
          </Button>
        </form>
      </div>

      <div className="mt-12 text-center text-sm font-medium text-gray-400">
        <p>Thuộc hệ sinh thái Y tế công cộng</p>
        <p className="mt-1">Dành cho đội phản ứng nhanh 115</p>
      </div>
    </main>
  );
}
