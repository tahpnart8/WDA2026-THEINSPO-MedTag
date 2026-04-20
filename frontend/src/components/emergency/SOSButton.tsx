'use client';
import { useState } from 'react';
import { triggerSOS } from '@/lib/api';
import { Siren, X } from 'lucide-react';

export default function SOSButton({ shortId }: { shortId: string }) {
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
            (pos) => sendSOSReq(pos.coords.latitude, pos.coords.longitude),
            () => sendSOSReq(undefined, undefined),
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
            setMessage(err.message || 'Lỗi gửi SOS');
        }
    };

    if (status === 'SUCCESS') {
        return (
            <div className="bg-red-50 border border-red-200 rounded-[28px] p-5 text-center animate-in zoom-in duration-300 shadow-sm w-full relative overflow-hidden">
                <Siren className="mx-auto text-red-500 animate-pulse mb-2" size={32} />
                <h3 className="text-xl font-black text-red-700 mb-1 tracking-tighter">ĐÃ PHÁT TÍN HIỆU!</h3>
                <p className="text-red-500 text-xs font-semibold">Tọa độ đã gửi đến Guardian.</p>
            </div>
        );
    }

    if (status === 'COUNTDOWN') {
        return (
            <div className="w-full bg-white rounded-[28px] border border-red-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-5 flex items-center justify-between animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border-4 border-red-100 flex items-center justify-center bg-red-50">
                        <span className="text-2xl font-black text-red-600 animate-pulse">{timeLeft}</span>
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-red-600 text-sm tracking-wide">ĐANG MỞ CẤP CỨU...</p>
                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-0.5">Hệ thống đang định vị GPS</p>
                    </div>
                </div>
                <button
                    onClick={cancelCountdown}
                    className="bg-gray-100 p-3 h-14 w-14 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-200 active:scale-95 transition-all outline-none"
                >
                    <X size={24} strokeWidth={3} />
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            {status === 'ERROR' && (
                <p className="text-red-600 text-center mb-2 font-bold text-xs bg-red-50 p-2 rounded-xl">{message}</p>
            )}
            <button
                onClick={startCountdown}
                className="w-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-[28px] p-5 shadow-[0_8px_30px_rgba(239,68,68,0.3)] active:scale-[0.98] transition-transform flex items-center justify-center gap-4 border border-red-600/50"
            >
                <div className="bg-white/20 p-2.5 rounded-full">
                    <Siren size={28} className="animate-pulse" />
                </div>
                <div className="text-left">
                    <span className="block text-2xl font-black tracking-widest leading-none">CẤP CỨU</span>
                    <span className="block text-red-100 text-[10px] uppercase font-bold tracking-widest mt-1 opacity-90">Gọi người thân lập tức</span>
                </div>
            </button>
        </div>
    );
}
