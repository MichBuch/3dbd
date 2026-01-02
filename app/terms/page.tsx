export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 p-8 pt-24 max-w-4xl mx-auto">
            <h1 className="text-4xl font-black text-white mb-8">Terms of Service</h1>
            <div className="space-y-6">
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-2">1. Acceptance of Terms</h2>
                    <p>By accessing and using 3DBD ("the Game"), you agree to be bound by these Terms of Service.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-2">2. User Accounts</h2>
                    <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-2">3. User Conduct</h2>
                    <p>You agree not to use the Game for any unlawful purpose or to violate any laws in your jurisdiction.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-2">4. Modification of Terms</h2>
                    <p>We reserve the right to modify these terms at any time. Your continued use of the Game constitutes acceptance of those changes.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-2">5. Contact</h2>
                    <p>If you have questions about these Terms, please contact us at support@3dbd.com.</p>
                </section>
            </div>
        </div>
    );
}
