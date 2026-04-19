import { EmergencyContact } from '@/types/emergency';

interface ContactBoxProps {
    name: string;
    contact: EmergencyContact;
}

export default function ContactBox({ name, contact }: ContactBoxProps) {
    return (
        <div className="bg-emerald-600 text-white rounded-2xl p-5 shadow-lg mb-4 border border-emerald-700">
            <h2 className="text-3xl font-black mb-1">{name}</h2>

            <div className="mt-4 pt-4 border-t border-emerald-500/50">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-200 mb-2">Liên Hệ Khẩn Cấp</h3>
                <p className="font-bold text-xl">{contact.name}</p>
                <a
                    href={`tel:${contact.phone}`}
                    className="mt-3 inline-flex items-center justify-center w-full bg-white text-emerald-700 font-black text-2xl py-3 rounded-xl shadow-md active:scale-95 transition-transform"
                >
                    📞 {contact.phone}
                </a>
            </div>
        </div>
    );
}
