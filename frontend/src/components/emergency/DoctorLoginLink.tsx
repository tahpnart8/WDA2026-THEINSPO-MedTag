import Link from 'next/link';

interface DoctorLoginLinkProps {
    shortId: string;
}

export default function DoctorLoginLink({ shortId }: DoctorLoginLinkProps) {
    return (
        <div className="mt-8 flex justify-center pb-8 border-t border-gray-200 pt-6">
            <Link
                href={`/medical/login?shortId=${shortId}`}
                className="text-gray-600 text-sm font-semibold hover:text-blue-700 flex items-center gap-2 transition-colors border-2 border-gray-200 rounded-full px-5 py-2.5 bg-white shadow-sm active:bg-gray-50"
            >
                <span className="text-lg">🏥</span> Đăng nhập Y Tế Đặc Quyền
            </Link>
        </div>
    );
}
