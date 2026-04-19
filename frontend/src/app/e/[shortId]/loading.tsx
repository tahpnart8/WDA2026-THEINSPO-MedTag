export default function Loading() {
    return (
        <main className="max-w-md mx-auto min-h-screen bg-gray-50 pb-12 pt-8 px-4 flex flex-col animate-pulse">
            <div className="flex flex-col items-center mb-6">
                <div className="w-48 h-48 rounded-3xl bg-gray-300 mb-3 mx-auto shadow-xl" />
                <div className="h-8 w-40 bg-gray-300 rounded-full mx-auto" />
            </div>

            <div className="h-40 bg-emerald-600/30 rounded-2xl mb-4" />

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-32 bg-gray-300 rounded-2xl" />
                <div className="h-32 bg-red-600/30 rounded-2xl" />
            </div>

            <div className="h-32 bg-amber-400/30 rounded-2xl mb-8" />

            <div className="h-48 bg-red-600/30 rounded-3xl mt-4" />
        </main>
    );
}
