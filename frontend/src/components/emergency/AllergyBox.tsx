import { ShieldAlert } from 'lucide-react';

export default function AllergyBox({ items }: { items: string[] }) {
    return (
        <div className="bg-orange-50/50 text-orange-800 rounded-3xl p-4 shadow-sm border border-orange-100 h-full flex flex-col justify-center">
            <div className="flex items-center gap-1.5 mb-2 justify-center text-orange-600">
                <ShieldAlert size={16} className="opacity-80" strokeWidth={2.5} />
                <h3 className="font-bold uppercase tracking-wider text-[10px]">Dị Ứng</h3>
            </div>
            {items.length > 0 ? (
                <ul className="text-center font-bold">
                    {items.map((item, idx) => (
                        <li key={idx} className="leading-tight text-sm mb-1">{item}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-orange-300 italic font-medium text-[11px] text-center">Không ghi nhận</p>
            )}
        </div>
    );
}
