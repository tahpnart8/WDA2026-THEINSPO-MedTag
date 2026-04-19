interface ConditionBoxProps {
    items: string[];
}

export default function ConditionBox({ items }: ConditionBoxProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className="bg-amber-400 text-black rounded-2xl p-4 shadow-lg mt-4 border border-amber-500">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚠️</span>
                <h3 className="font-black uppercase tracking-wider text-sm">Bệnh Nền Nghiêm Trọng</h3>
            </div>
            <ul className="space-y-2 mt-3">
                {items.map((item, idx) => (
                    <li key={idx} className="font-bold text-lg bg-amber-300 px-3 py-2 rounded-lg leading-tight">
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}
