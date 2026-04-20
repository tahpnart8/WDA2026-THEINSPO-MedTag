import { fetchEmergencyProfile } from '@/lib/api';
import VisualCheck from '@/components/emergency/VisualCheck';
import ContactBox from '@/components/emergency/ContactBox';
import BloodTypeBox from '@/components/emergency/BloodTypeBox';
import AllergyBox from '@/components/emergency/AllergyBox';
import ConditionBox from '@/components/emergency/ConditionBox';
import SOSButton from '@/components/emergency/SOSButton';
import DoctorLoginLink from '@/components/emergency/DoctorLoginLink';
import ClientGateWrapper from './ClientGateWrapper';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';

export const metadata = {
    title: 'Hồ Sơ Cấp Cứu | MedTag',
    description: 'Hệ thống thông tin y tế khẩn cấp MedTag',
};

export default async function EmergencyPage({ params }: { params: Promise<{ shortId: string }> }) {
    const unwrappedParams = await params;
    let profile;
    try {
        profile = await fetchEmergencyProfile(unwrappedParams.shortId);
    } catch (error) {
        notFound();
    }

    return (
        <ClientGateWrapper>
            <main className="max-w-md mx-auto min-h-screen bg-gray-50 pb-40 pt-16 px-4 font-sans selection:bg-blue-200 relative">
                {/* Nút thoát - Trở về trang chủ */}
                <div className="absolute top-4 left-4 z-50">
                    <Link
                        href="/"
                        className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white active:scale-95 transition-all"
                        title="Thoát và quay lại trang chủ"
                    >
                        <X size={20} strokeWidth={3} />
                    </Link>
                </div>

                <VisualCheck avatar={profile.avatarUrl} />
                <ContactBox name={profile.patientName} contact={profile.emergencyContact} />

                <div className="grid grid-cols-2 gap-4">
                    <BloodTypeBox type={profile.bloodTypeDisplay} />
                    <AllergyBox items={profile.allergies} />
                </div>

                <ConditionBox items={profile.dangerousConditions} />

                {profile.notes && (
                    <div className="mt-6 bg-amber-50/50 border border-amber-100 p-6 rounded-[2rem] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                        <h3 className="text-[10px] uppercase tracking-widest font-black text-amber-600 mb-3 ml-2">Ghi chú y tế</h3>
                        <p className="text-slate-700 font-medium text-sm leading-relaxed whitespace-pre-wrap ml-2 italic">
                            "{profile.notes}"
                        </p>
                    </div>
                )}

                <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-gradient-to-t from-white via-white/90 to-transparent z-50 pointer-events-none">
                    <div className="max-w-md mx-auto pointer-events-auto shadow-2xl rounded-3xl">
                        <SOSButton shortId={unwrappedParams.shortId} />
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <DoctorLoginLink shortId={unwrappedParams.shortId} />
                </div>
            </main>
        </ClientGateWrapper>
    );
}
