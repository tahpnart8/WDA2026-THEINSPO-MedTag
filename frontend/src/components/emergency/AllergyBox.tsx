interface AllergyBoxProps {
    items: string[];
}

export default function AllergyBox({ items }: AllergyBoxProps) {
    return (
        <div className="bg-red-600 text-white rounded-2xl p-4 shadow-lg min-h-32 border border-red-700">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⛔</span>
                <h3 className="font-bold uppercase tracking-wider text-sm">Dị Ứng</h3>
            </div>
            {items.length > 0 ? (
                <ul className="list-disc list-inside text-lg font-bold leading-tight">
                    {items.map((item, idx) => (
                        <li key={idx} className="mb-1">{item}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-red-200 italic font-medium">Không có dữ liệu</p>
            )}
        </div>
    );
}
