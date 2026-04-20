import { Activity } from 'lucide-react';

export default function ConditionBox({ items }: { items: string[] }) {
    if (!items || items.length === 0) return null;

    return (
        <div className="bg-sky-50 text-sky-900 rounded-3xl p-5 shadow-sm mt-4 border border-sky-100/50">
            <div className="flex items-center gap-2 mb-3">
                <Activity className="text-sky-500" size={18} strokeWidth={2.5} />
                <h3 className="font-bold uppercase tracking-wider text-[10px] text-sky-600">Bệnh Nền Trọng Yếu</h3>
            </div>
            <ul className="flex flex-wrap gap-2">
                {items.map((item, idx) => (
                    <li key={idx} className="font-bold text-sm bg-white border border-sky-100/80 px-3.5 py-2 rounded-xl text-sky-800 shadow-sm leading-none">
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}
