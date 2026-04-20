import { Droplets } from 'lucide-react';

export default function BloodTypeBox({ type }: { type: string }) {
    return (
        <div className="bg-red-50/50 text-red-700 rounded-3xl p-4 flex flex-col items-center justify-center shadow-sm h-full border border-red-100">
            <Droplets size={24} className="mb-1 opacity-80" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">Nhóm Máu</span>
            <span className="text-4xl font-black tracking-tighter">{type}</span>
        </div>
    );
}
