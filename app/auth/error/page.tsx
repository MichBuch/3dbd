export default function AuthError() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-900 border border-red-500 rounded-xl p-8 text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h1>
                <p className="text-gray-300 mb-6">
                    There was a problem with your authentication request. Please try again.
                </p>
                <a
                    href="/"
                    className="inline-block bg-gradient-to-r from-neonBlue to-neonPink text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity"
                >
                    Back to Home
                </a>
            </div>
        </div>
    );
}
