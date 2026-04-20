import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center animate-in zoom-in-95 duration-500">
                <div className="text-6xl mb-6">🏜️</div>
                <h1 className="text-2xl font-black text-gray-900 mb-2">Lạc đường rồi! (404)</h1>
                <p className="text-gray-500 mb-8 text-sm">Trang bạn đang tìm kiếm không tồn tại, sai đường dẫn, hoặc đã bị xóa khỏi hệ thống.</p>
                <Link href="/" className="w-full block bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-md">
                    🏠 Quay Về Trang Chủ
                </Link>
            </div>
        </div>
    );
}
