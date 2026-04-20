import Image from 'next/image';
import { UserCheck } from 'lucide-react';

export default function VisualCheck({ avatar }: { avatar: string | null }) {
    return (
        <div className="flex flex-col items-center mb-6">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[3px] border-white shadow-sm overflow-hidden relative bg-blue-50 flex items-center justify-center">
                {avatar ? (
                    <Image src={avatar} alt="Patient avatar" fill className="object-cover" />
                ) : (
                    <UserCheck className="text-blue-300 w-12 h-12" strokeWidth={1.5} />
                )}
            </div>
            <div className="mt-[-12px] z-10 bg-white text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-blue-100 flex items-center gap-1.5">
                <UserCheck size={14} strokeWidth={2.5} /> ĐÃ XÁC MINH
            </div>
        </div>
    );
}
