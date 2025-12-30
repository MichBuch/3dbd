import Link from 'next/link';

export default function TermsPage() {
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
                    Terms of Service
                </h1>

                <div className="prose prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-300">
                            By accessing and using 3DBD ("the Game"), you accept and agree to be bound by the terms and provision of this agreement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
                        <p className="text-gray-300 mb-2">
                            Permission is granted to temporarily access and use the Game for personal, non-commercial purposes. This license does not include:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                            <li>Modifying or copying the materials</li>
                            <li>Using the materials for any commercial purpose</li>
                            <li>Attempting to decompile or reverse engineer any software contained in the Game</li>
                            <li>Removing any copyright or proprietary notations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
                        <p className="text-gray-300">
                            When you create an account with us, you must provide accurate, complete, and current information.
                            Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Game Rules & Conduct</h2>
                        <p className="text-gray-300 mb-2">You agree not to:</p>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                            <li>Use cheats, hacks, or unauthorized third-party software</li>
                            <li>Harass, abuse, or harm other players</li>
                            <li>Exploit bugs or glitches for personal gain</li>
                            <li>Create multiple accounts to manipulate rankings</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Premium Subscription</h2>
                        <p className="text-gray-300">
                            Premium subscriptions are billed monthly or annually. You may cancel your subscription at any time.
                            Refunds are not provided for partial months/years.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Disclaimer</h2>
                        <p className="text-gray-300">
                            The Game is provided "as is". We make no warranties, expressed or implied, and hereby disclaim all warranties
                            including, without limitation, implied warranties of merchantability, fitness for a particular purpose,
                            and non-infringement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Limitations</h2>
                        <p className="text-gray-300">
                            In no event shall 3DBD or its suppliers be liable for any damages (including, without limitation,
                            damages for loss of data or profit) arising out of the use or inability to use the Game.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Terms</h2>
                        <p className="text-gray-300">
                            We reserve the right to modify these terms at any time. We will notify users of any material changes
                            by posting the new Terms of Service on this page.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
                        <p className="text-gray-300">
                            If you have any questions about these Terms, please contact us at: support@3d4bd.com
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
