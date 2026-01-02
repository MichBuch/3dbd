export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 p-8 pt-24 max-w-4xl mx-auto font-sans leading-relaxed">
            <h1 className="text-4xl font-black text-white mb-8 border-b border-white/10 pb-4">Privacy Policy</h1>
            <div className="space-y-8">
                <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                    <p>3DBD ("we," "our," or "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or play our game. Please read this privacy policy carefully.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-2">Personal Data</h3>
                            <p>We may collect personal information that you voluntarily provide to us when creating an account, such as:</p>
                            <ul className="list-disc pl-5 mt-2">
                                <li>Name and email address (from third-party login providers like Google, GitHub, Facebook, TikTok).</li>
                                <li>Profile picture URL.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-2">Derivative Data</h3>
                            <p>Our servers automatically collect information when you access the Game, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Game.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>Create and manage your account.</li>
                        <li>Facilitate gameplay and multiplayer matchmaking.</li>
                        <li>Monitor and analyze usage and trends to improve your experience.</li>
                        <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">4. Disclosure of Your Information</h2>
                    <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
                        <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including data analysis, email delivery, hosting services, and customer service.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">5. Security of Your Information</h2>
                    <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">6. Policy for Children</h2>
                    <p>We do not knowingly solicit information from or market to children under the age of 13. If we become aware that we have collected data from a child under age 13 without verification of parental consent, we will delete that information as quickly as possible.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">7. Contact Us</h2>
                    <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
                    <p className="mt-2 text-neonBlue">privacy@3dbd.com</p>
                </section>
            </div>
        </div>
    );
}
