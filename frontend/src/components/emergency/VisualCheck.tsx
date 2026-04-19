import Image from 'next/image';

interface VisualCheckProps {
    avatar: string | null;
}

export default function VisualCheck({ avatar }: VisualCheckProps) {
    return (
        <div className="flex flex-col items-center mb-6">
            <div className="w-48 h-48 rounded-3xl border-4 border-white shadow-xl overflow-hidden relative bg-gray-200 flex items-center justify-center">
                {avatar ? (
                    <Image src={avatar} alt="Patient avatar" fill className="object-cover" />
                ) : (
                    <span className="text-gray-400 text-6xl">👤</span>
                )}
            </div>
            <div className="mt-3 bg-black text-white px-4 py-1 rounded-full text-sm font-bold tracking-widest shadow-md">
                ĐỐI CHIẾU KHUÔN MẶT
            </div>
        </div>
    );
}
