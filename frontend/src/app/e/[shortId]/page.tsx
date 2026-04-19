'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { SOSButton } from '@/components/emergency/SOSButton';
import { AntiSpamGate } from '@/components/emergency/AntiSpamGate';

export default function EmergencyPortal({ params }: { params: { shortId: string } }) {
  const [isVerified, setIsVerified] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { shortId } = params;

  useEffect(() => {
    if (isVerified) {
      const fetchPatientData = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/emergency/${shortId}`);
          if (!res.ok) {
            throw new Error('Mã thiết bị không hợp lệ hoặc đã hết hạn.');
          }
          const data = await res.json();
          setPatient({
            id: data.deviceId,
            shortId: shortId,
            name: data.patientName,
            gender: 'Nam/Nữ', // TODO: Cập nhật DB schema sau nếu cần
            age: '--',
            bloodType: data.bloodType || 'Chưa rõ',
            allergies: data.allergies || 'Không ghi nhận',
            dangerousConditions: data.dangerousConditions || 'Không có',
            emergencyContact: data.emergencyContact,
            avatar: data.avatarUrl
          });
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchPatientData();
    }
  }, [isVerified, shortId]);

  if (!isVerified) {
    return <AntiSpamGate onVerified={() => setIsVerified(true)} />;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-xl font-bold animate-pulse text-gray-500">Đang trích xuất hồ sơ...</p></div>;
  }

  if (error || !patient) {
    return <div className="min-h-screen flex items-center justify-center p-6 text-center"><p className="text-2xl font-black text-red-600">{error}</p></div>;
  }

  return (
    <main className="max-w-md mx-auto p-4 min-h-screen bg-gray-100 flex flex-col pb-24">
      {/* VISUAL DOUBLE CHECK (Sinh trắc thị giác) */}
      <div className="flex flex-col items-center mt-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <p className="text-sm font-bold text-red-600 mb-2 uppercase tracking-widest animate-pulse">Đối chiếu khuôn mặt</p>
        <div className="w-48 h-48 rounded-3xl overflow-hidden border-4 border-white shadow-2xl mb-4 bg-white">
          <img src={patient.avatar} alt="Patient Face" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* GREEN BOX - THÔNG TIN CÁ NHÂN & LIÊN HỆ */}
        <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-xl border-4 border-emerald-500">
           <h1 className="text-3xl font-black mb-1 tracking-tight">{patient.name}</h1>
           <p className="text-lg font-medium opacity-90 mb-4">{patient.gender} • {patient.age}</p>
           
           <div className="bg-emerald-800/40 rounded-xl p-3">
             <p className="text-xs uppercase tracking-widest opacity-80 mb-1 font-bold">Người thân liên hệ</p>
             <p className="text-2xl font-black">{patient.emergencyContact}</p>
           </div>
        </div>

        {/* BLACK BOX & RED BOX */}
        <div className="grid grid-cols-2 gap-4">
          {/* BLACK BOX - NHÓM MÁU */}
          <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center border-4 border-gray-800">
            <span className="text-sm uppercase tracking-widest opacity-70 mb-2 font-black text-gray-400">Nhóm máu</span>
            <span className="text-6xl font-black">{patient.bloodType}</span>
          </div>
          
          {/* RED BOX - DỊ ỨNG */}
          <div className="bg-red-600 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-center border-4 border-red-500">
            <span className="text-sm uppercase tracking-widest opacity-90 mb-2 font-black text-red-200">Dị ứng thuốc</span>
            <span className="text-xl font-bold leading-tight">{patient.allergies}</span>
          </div>
        </div>
        
        {/* YELLOW BOX - BỆNH NỀN KHẨN CẤP */}
        <div className="bg-yellow-400 text-yellow-950 rounded-3xl p-6 shadow-xl border-4 border-yellow-300">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-sm uppercase tracking-widest font-black">Bệnh nền nguy hiểm</h3>
          </div>
          <p className="text-xl font-bold leading-snug">{patient.dangerousConditions}</p>
        </div>
      </div>

      {/* KHU VỰC NÚT CẤP CỨU */}
      <div className="mt-8">
        <SOSButton qrCode={patient.shortId} />
      </div>

      <p className="text-center text-xs text-gray-400 mt-8 font-medium">
        MedTag &copy; 2026 • Zero-download Rescue
      </p>
    </main>
  );
}


