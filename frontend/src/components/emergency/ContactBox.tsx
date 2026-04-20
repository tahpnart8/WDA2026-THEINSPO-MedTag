import { EmergencyContact } from '@/types/emergency';
import { PhoneCall, User } from 'lucide-react';

export default function ContactBox({ name, contact }: { name: string, contact: EmergencyContact }) {
    return (
        <div className="bg-white rounded-3xl p-5 shadow-sm mb-4 border border-blue-50 flex flex-col items-center text-center">
            <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-2">
                <User className="text-blue-500" size={24} /> {name}
            </h2>

            <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Guardian / Người thân</h3>
                <p className="font-bold text-lg text-slate-800 mb-3">{contact.name}</p>
                <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-bold text-lg py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:bg-blue-700 hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all active:scale-[0.98]"
                >
                    <PhoneCall size={20} /> {contact.phone}
                </a>
            </div>
        </div>
    );
}
