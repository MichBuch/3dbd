import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-neonBlue to-neonPink rounded-lg flex items-center justify-center">
                            <span className="text-black font-black text-lg">3D</span>
                        </div>
                        <span className="text-white font-bold text-xl">3DBD</span>
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 pt-24 pb-12">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-neonPink mb-8">
                    Privacy Policy
                </h1>

                <div className="prose prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                        <p className="text-gray-300 mb-3">We collect the following types of information:</p>

                        <h3 className="text-xl font-semibold text-white mb-2">Account Information</h3>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4 mb-3">
                            <li>Email address</li>
                            <li>Username/display name</li>
                            <li>Profile picture (if using OAuth providers)</li>
                            <li>Password (encrypted)</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white mb-2">Game Data</h3>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4 mb-3">
                            <li>Game scores and statistics</li>
                            <li>Match history</li>
                            <li>Difficulty preferences</li>
                            <li>UI settings and preferences</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white mb-2">Usage Data</h3>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                            <li>Browser type and version</li>
                            <li>Pages visited and time spent</li>
                            <li>Device information</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li>To provide and maintain the Game</li>
                            <li>To notify you about changes to our service</li>
                            <li>To provide customer support</li>
                            <li>To gather analysis or valuable information to improve the Game</li>
                            <li>To monitor the usage of the Game</li>
                            <li>To detect, prevent and address technical issues</li>
                            <li>To fulfill any other purpose for which you provide it</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Cookies and Local Storage</h2>
                        <p className="text-gray-300 mb-2">
                            We use cookies and local storage to:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                            <li>Remember your preferences and settings</li>
                            <li>Keep you logged in</li>
                            <li>Analyze how you use the Game</li>
                            <li>Store game state and progress</li>
                        </ul>
                        <p className="text-gray-300 mt-3">
                            You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.
                            However, some parts of the Game may not function properly without cookies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                        <p className="text-gray-300">
                            The security of your data is important to us. We use industry-standard encryption and security measures
                            to protect your personal information. However, no method of transmission over the Internet or method of
                            electronic storage is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Services</h2>
                        <p className="text-gray-300 mb-2">
                            We use third-party services that may collect information:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                            <li>OAuth providers (Google, GitHub, Facebook) for authentication</li>
                            <li>Payment processors (Stripe) for premium subscriptions</li>
                            <li>Analytics services to improve the Game</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
                        <p className="text-gray-300 mb-2">You have the right to:</p>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Object to processing of your data</li>
                            <li>Request data portability</li>
                            <li>Withdraw consent at any time</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Children's Privacy</h2>
                        <p className="text-gray-300">
                            Our Service does not address anyone under the age of 13. We do not knowingly collect personally
                            identifiable information from anyone under the age of 13.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Privacy Policy</h2>
                        <p className="text-gray-300">
                            We may update our Privacy Policy from time to time. We will notify you of any changes by posting
                            the new Privacy Policy on this page and updating the "Last updated" date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
                        <p className="text-gray-300">
                            If you have any questions about this Privacy Policy, please contact us at: privacy@3d4bd.com
                        </p>
                    </section>

                    <p className="text-gray-500 text-sm mt-8 border-t border-gray-700 pt-4">
                        Last updated: December 28, 2025
                    </p>
                </div>

                <Link
                    href="/"
                    className="inline-block mt-8 px-6 py-3 bg-neonBlue text-black font-bold rounded-lg hover:bg-neonBlue/90 transition-colors"
                >
                    Back to Game
                </Link>
            </main>
        </div>
    );
}
