'use client';
import { useState } from 'react';
import { triggerSOS } from '@/lib/api';

interface SOSButtonProps {
    shortId: string;
}

export default function SOSButton({ shortId }: SOSButtonProps) {
    const [status, setStatus] = useState<'IDLE' | 'COUNTDOWN' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [timeLeft, setTimeLeft] = useState(15);
    const [message, setMessage] = useState('');
    const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

    const startCountdown = () => {
        if (status !== 'IDLE') return;
        setStatus('COUNTDOWN');
        setTimeLeft(15);

        if (navigator.vibrate) navigator.vibrate(200);

        const id = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(id);
                    executeSOS();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        setTimerId(id);
    };

    const cancelCountdown = () => {
        if (timerId) clearInterval(timerId);
        setStatus('IDLE');
        setTimeLeft(15);
    };

    const executeSOS = () => {
        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);

        if (!navigator.geolocation) {
            sendSOSReq(undefined, undefined);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                sendSOSReq(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.warn('Geolocation error:', error);
                sendSOSReq(undefined, undefined);
            },
            { timeout: 5000, enableHighAccuracy: true }
        );
    };

    const sendSOSReq = async (lat?: number, lng?: number) => {
        setStatus('IDLE');
        try {
            const res = await triggerSOS(shortId, lat, lng);
            setStatus('SUCCESS');
            setMessage(res.message);
        } catch (err: any) {
            setStatus('ERROR');
            setMessage(err.message || 'Lỗi khi gửi SOS');
        }
    };

    if (status === 'SUCCESS') {
        return (
            <div className="bg-red-100 border-2 border-red-500 rounded-2xl p-6 mt-8 text-center animate-in zoom-in duration-300">
                <span className="text-6xl mb-2 block animate-bounce">🚨</span>
                <h3 className="text-2xl font-black text-red-700 mb-2">ĐÃ PHÁT TÍN HIỆU!</h3>
                <p className="text-red-600 font-medium">{message}</p>
                <p className="text-red-500 text-sm mt-3 font-semibold">Tọa độ GPS đã được gửi đến người thân.</p>
            </div>
        );
    }

    if (status === 'COUNTDOWN') {
        return (
            <div className="mt-8 flex flex-col items-center">
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#fee2e2" strokeWidth="8" />
                        <circle
                            cx="50" cy="50" r="45" fill="none" stroke="#ef4444" strokeWidth="8"
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * (timeLeft / 15))}
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>
                    <div className="text-center z-10 text-red-600">
                        <span className="text-6xl font-black tabular-nums">{timeLeft}</span>
                        <span className="block text-sm font-bold uppercase mt-1">GIÂY</span>
                    </div>
                </div>

                <button
                    onClick={cancelCountdown}
                    className="mt-6 bg-gray-200 text-gray-700 font-bold px-8 py-4 rounded-full uppercase tracking-wider active:bg-gray-300 active:scale-95 transition-all text-xl shadow-sm"
                >
                    HỦY BỎ
                </button>
            </div>
        );
    }

    return (
        <div className="mt-8">
            {status === 'ERROR' && (
                <p className="text-red-600 text-center mb-4 font-bold bg-red-100 p-3 rounded-xl">{message}</p>
            )}
            <button
                onClick={startCountdown}
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-3xl py-6 shadow-xl shadow-red-600/30 active:scale-[0.98] transition-all flex flex-col items-center border border-red-500"
            >
                <span className="text-5xl mb-2">🆘</span>
                <span className="text-4xl font-black tracking-widest">CẤP CỨU</span>
                <span className="text-red-200 text-sm mt-3 font-medium">Sẽ đếm ngược 15 giây trước khi gửi</span>
            </button>
        </div>
    );
}
