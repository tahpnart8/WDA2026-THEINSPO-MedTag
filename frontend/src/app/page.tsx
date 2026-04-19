import { Card } from '@/components/ui/Card';
import { SOSButton } from '@/components/emergency/SOSButton';

export default function EmergencyPortal() {
  // Mock data mô phỏng thông tin lấy được từ mã QR
  const patient = {
    id: 'mock-123',
    name: 'Nguyễn Văn A',
    bloodType: 'O+',
    allergies: 'Penicillin, Đậu phộng',
    dangerousConditions: 'Tiền sử nhồi máu cơ tim, Huyết áp cao thường xuyên',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0'
  };

  return (
    <main className="max-w-md mx-auto p-5 min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Header Profile - Avatar to */}
      <div className="flex flex-col items-center mt-6 mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4 bg-white">
          <img src={patient.avatar} alt={patient.name} className="w-full h-full object-cover" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-1 tracking-tight">{patient.name}</h1>
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full mt-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="text-sm font-bold uppercase tracking-wider">Hồ sơ cấp cứu</span>
        </div>
      </div>

      {/* Thông tin sinh tồn (Vital Info) */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card variant="black" className="flex flex-col items-center justify-center p-6 text-center shadow-lg">
          <span className="text-sm uppercase tracking-widest opacity-70 mb-2 font-semibold">Nhóm máu</span>
          <span className="text-5xl font-black text-red-500 drop-shadow-md">{patient.bloodType}</span>
        </Card>
        
        <Card variant="danger" className="flex flex-col items-center justify-center p-6 text-center shadow-lg">
          <span className="text-sm uppercase tracking-widest opacity-70 mb-2 font-semibold text-red-800">Dị ứng</span>
          <span className="text-xl font-bold leading-tight text-red-950">{patient.allergies}</span>
        </Card>
      </div>

      {/* Bệnh nền nguy hiểm */}
      <Card variant="warning" className="p-6 mb-10 shadow-lg border-2 border-yellow-300">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">⚠️</span>
          <h3 className="text-sm uppercase tracking-widest opacity-80 font-black text-yellow-900">Bệnh nền nguy hiểm</h3>
        </div>
        <p className="text-2xl font-bold text-yellow-950 leading-snug">{patient.dangerousConditions}</p>
      </Card>

      {/* Khu vực nút Cấp Cứu (Nổi bật nhất) */}
      <div className="mt-auto">
        <SOSButton patientId={patient.id} />
      </div>

      <p className="text-center text-xs text-gray-400 mt-8 font-medium">
        Hệ thống MedTag &copy; 2026<br/>Dữ liệu được bảo mật chuẩn y tế
      </p>
    </main>
  );
}
