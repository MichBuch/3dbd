export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 p-8 pt-24 max-w-4xl mx-auto">
            <h1 className="text-4xl font-black text-white mb-8">Privacy Policy</h1>
            <div className="space-y-6">
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-2">1. Information We Collect</h2>
                    <p>We collect information you provide directly to us, such as when you create an account, specifically your name, email address, and profile picture from third-party login providers (Google, GitHub, TikTok, Facebook, etc.).</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-2">2. How We Use Information</h2>
                    <p>We use the information we collect to operate, maintain, and improve the Game, and to communicate with you.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-2">3. Data Sharing</h2>
                    <p>We do not share your personal information with third parties except as compelled by law or to protect our rights.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-2">4. Data Deletion</h2>
                    <p>You may request deletion of your data at any time by contacting us or using the delete account feature within the app.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-2">5. Contact</h2>
                    <p>If you have questions about this Policy, please contact us at privacy@3dbd.com.</p>
                </section>
            </div>
        </div>
    );
}
