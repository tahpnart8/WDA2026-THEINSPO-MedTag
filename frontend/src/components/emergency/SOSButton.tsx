'use client';

import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';

export function SOSButton({ qrCode }: { qrCode: string }) {
  const [status, setStatus] = useState<'IDLE' | 'COUNTING' | 'TRIGGERED'>('IDLE');
  const [countdown, setCountdown] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startCountdown = () => {
    setStatus('COUNTING');
    setCountdown(15);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          triggerEmergency();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('IDLE');
    setCountdown(15);
  };

  const triggerEmergency = () => {
    setStatus('TRIGGERED');
    
    const sendSOSRequest = async (lat?: number, lng?: number) => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/emergency/${qrCode}/sos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: lat, longitude: lng }),
        });
      } catch (error) {
        console.error('Lỗi khi gửi SOS API:', error);
      }
    };

    // Yêu cầu lấy tọa độ GPS
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          sendSOSRequest(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('[MedTag] GPS Error:', error.message);
          sendSOSRequest(); // Fallback gửi không có tọa độ
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      sendSOSRequest();
    }
  };

  if (status === 'TRIGGERED') {
    return (
      <div className="text-center p-8 bg-red-100 rounded-3xl border-4 border-red-500 shadow-inner animate-in fade-in zoom-in">
        <div className="text-6xl mb-4">🚨</div>
        <h3 className="text-2xl font-black text-red-700 mb-2 uppercase">Đã phát tín hiệu!</h3>
        <p className="text-red-900 font-medium">
          Hệ thống đang gửi vị trí của bạn tới người thân và trung tâm cấp cứu gần nhất. Vui lòng giữ người bệnh ở vị trí an toàn.
        </p>
      </div>
    );
  }

  if (status === 'COUNTING') {
    const dashOffset = 377 - (377 * countdown) / 15;
    return (
      <div className="flex flex-col items-center justify-center space-y-6 bg-red-50 p-8 rounded-3xl border-4 border-red-500 shadow-2xl animate-in slide-in-from-bottom-4">
        <div className="relative flex items-center justify-center w-36 h-36 bg-white rounded-full shadow-inner">
          <span className="text-6xl font-black text-red-600 tabular-nums">{countdown}</span>
          <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
             <circle cx="72" cy="72" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-red-100" />
             <circle 
                cx="72" cy="72" r="60" 
                stroke="currentColor" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray="377" 
                strokeDashoffset={dashOffset}
                className="text-red-600 transition-all duration-1000 ease-linear" 
             />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-red-700 text-center uppercase tracking-wide">
          Đang chuẩn bị gửi...
        </h3>
        <Button 
          variant="outline" 
          size="lg" 
          onClick={cancelCountdown} 
          className="w-full bg-white text-gray-900 border-gray-300 hover:bg-gray-100 h-16 text-xl"
        >
          HỦY CẤP CỨU
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="danger" 
      onClick={startCountdown} 
      className="w-full py-6 shadow-[0_8px_30px_rgb(220,38,38,0.5)] hover:shadow-[0_8px_40px_rgb(220,38,38,0.7)] hover:-translate-y-1 transition-all duration-300 rounded-[2rem] h-auto"
    >
      <div className="flex flex-col items-center gap-2 py-4">
        <span className="text-5xl animate-bounce">🆘</span>
        <span className="text-4xl font-black tracking-widest uppercase">Cấp Cứu</span>
        <span className="text-base font-medium opacity-90 mt-1 uppercase tracking-wider">Chạm để đếm ngược 15s</span>
      </div>
    </Button>
  );
}

