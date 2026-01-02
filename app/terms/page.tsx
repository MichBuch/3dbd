export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 p-8 pt-24 max-w-4xl mx-auto font-sans leading-relaxed">
            <h1 className="text-4xl font-black text-white mb-8 border-b border-white/10 pb-4">Terms of Service</h1>
            <div className="space-y-8">
                <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                    <p>Welcome to 3DBD ("the Game", "we", "us", or "our"). By accessing or playing 3DBD, creating an account, or using our services, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Game.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility</h2>
                    <p>You must be at least 13 years of age to access or use the Game. If you are under 18, you represent that you have your parent or guardian's permission to use the Game. By using the Game, you represent and warrant that you meet these eligibility requirements.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>You may need to register for an account to access certain features. We support login via third-party providers including Google, GitHub, Facebook, and TikTok.</li>
                        <li>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</li>
                        <li>We reserve the right to suspend or terminate your account at our sole discretion if we believe you have violated these Terms.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">4. Prohibited Conduct</h2>
                    <p>You agree not to:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>Use the Game for any illegal purpose or in violation of any local, state, national, or international law.</li>
                        <li>Harass, abuse, or harm another person or group, including other players.</li>
                        <li>Use cheats, automation software (bots), hacks, or any other unauthorized third-party software to modify or automate the Game experience.</li>
                        <li>Interfere with or damage the Game, including through the use of viruses, cancel bots, Trojan horses, harmful code, flood pings, denial-of-service attacks, or IP spoofing.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
                    <p>The Game, including its code, graphics, gameplay mechanics, and "3DBD" branding, is the proprietary property of 3DBD and its licensors. You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Game for your personal, non-commercial entertainment.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">6. Virtual Items</h2>
                    <p>The Game may offer virtual items or currency (e.g., "bead skins"). These items have no real-world value and cannot be redeemed for cash. We reserve the right to modify or discontinue virtual items at any time.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">7. Disclaimer of Warranties</h2>
                    <p>THE GAME IS PROVIDED "AS IS" AND ON AN "AS AVAILABLE" BASIS. WE DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING RELATING TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">8. Limitation of Liability</h2>
                    <p>TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL 3DBD BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR ACCESS TO OR USE OF THE GAME.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
                    <p>If you have any questions about these Terms, please contact us at:</p>
                    <p className="mt-2 text-neonBlue">support@3dbd.com</p>
                </section>
            </div>
        </div>
    );
}
