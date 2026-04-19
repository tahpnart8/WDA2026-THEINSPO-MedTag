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
            <main className="max-w-md mx-auto min-h-screen bg-gray-50 pb-12 pt-8 px-4 font-sans selection:bg-blue-200">
                <VisualCheck avatar={profile.avatarUrl} />
                <ContactBox name={profile.patientName} contact={profile.emergencyContact} />

                <div className="grid grid-cols-2 gap-4">
                    <BloodTypeBox type={profile.bloodTypeDisplay} />
                    <AllergyBox items={profile.allergies} />
                </div>

                <ConditionBox items={profile.dangerousConditions} />
                <SOSButton shortId={unwrappedParams.shortId} />
                <DoctorLoginLink shortId={unwrappedParams.shortId} />
            </main>
        </ClientGateWrapper>
    );
}
