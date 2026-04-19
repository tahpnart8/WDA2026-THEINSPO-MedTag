interface BloodTypeBoxProps {
    type: string;
}

export default function BloodTypeBox({ type }: BloodTypeBoxProps) {
    return (
        <div className="bg-black text-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg h-32 border border-gray-800">
            <span className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1">Nhóm Máu</span>
            <span className="text-6xl font-black">{type}</span>
        </div>
    );
}
