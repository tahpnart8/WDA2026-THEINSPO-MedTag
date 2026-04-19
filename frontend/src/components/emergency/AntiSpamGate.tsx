'use client';

import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';

export function AntiSpamGate({ onVerified }: { onVerified: () => void }) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current!);
          setTimeout(onVerified, 200); // Đợi effect 100% rồi mới unmount
          return 100;
        }
        return prev + 5;
      });
    }, 50);
  };

  const handlePointerUp = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progress < 100) {
      setProgress(0); // Reset nếu thả tay ra sớm
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-md">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        
        <h2 className="text-2xl font-black text-gray-900 mb-2">Bảo mật dữ liệu</h2>
        <p className="text-gray-500 font-medium mb-8">
          Vui lòng nhấn và giữ nút bên dưới để xác minh bạn là nhân viên y tế / người cứu hộ.
        </p>

        <div className="relative w-full h-20 bg-gray-100 rounded-full overflow-hidden select-none touch-none cursor-pointer"
             onPointerDown={handlePointerDown}
             onPointerUp={handlePointerUp}
             onPointerLeave={handlePointerUp}
        >
          {/* Thanh progress chạy ngang */}
          <div 
            className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-black uppercase tracking-wider ${progress > 50 ? 'text-white' : 'text-gray-600'} transition-colors duration-200 pointer-events-none`}>
              {progress >= 100 ? 'Đã xác minh!' : 'Nhấn giữ để mở khóa'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
