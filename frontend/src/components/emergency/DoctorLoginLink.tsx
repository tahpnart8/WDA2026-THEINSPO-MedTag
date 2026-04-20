import Link from 'next/link';
import { Stethoscope } from 'lucide-react';

export default function DoctorLoginLink({ shortId }: { shortId: string }) {
    return (
        <Link href={`/medical/login?redirect=/medical/${shortId}`} className="inline-flex items-center justify-center gap-2 font-bold text-blue-600 text-xs bg-blue-50 px-5 py-3 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors shadow-sm tracking-wide">
            <Stethoscope size={16} strokeWidth={2.5} /> Luồng Y Tế Đặc Quyền
        </Link>
    );
}
