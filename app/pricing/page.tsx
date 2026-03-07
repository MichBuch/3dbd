import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: '3DBD Pricing — Play Free or Go Premium',
    description: 'Play vs the AI for free. Upgrade to Premium for online multiplayer and in-game chat. $9.99/year introductory offer.',
};

const features = {
    free: ['Play vs the AI', 'All game themes', 'Leaderboard access'],
    monthly: ['Everything in Free', 'Online multiplayer', 'In-game chat', 'Cancel anytime'],
    yearly: ['Everything in Free', 'Online multiplayer', 'In-game chat', 'Best value — save 83%'],
};

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-20">
            {/* Header */}
            <div className="text-center mb-12">
                <Link href="/" className="text-4xl font-black logo-neon mb-4 block">3DBD</Link>
                <h1 className="text-3xl font-bold text-white mb-3">Simple, honest pricing</h1>
                <p className="text-gray-400 max-w-md mx-auto">
                    Play against the AI for free. Upgrade to challenge real players online and unlock in-game chat.
                </p>
            </div>

            {/* Plans */}
            <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl mb-10">
                {/* Free */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl p-8 flex flex-col">
                    <h2 className="text-xl font-bold mb-1">Free</h2>
                    <div className="text-4xl font-black mb-6">$0</div>
                    <ul className="space-y-3 mb-8 flex-1">
                        {features.free.map(f => (
                            <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                                <span className="text-green-400 font-bold">✓</span> {f}
                            </li>
                        ))}
                    </ul>
                    <Link
                        href="/?signup=true"
                        className="block text-center bg-white/10 border border-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-colors"
                    >
                        Get Started Free
                    </Link>
                </div>

                {/* Monthly */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-neonBlue/50 rounded-2xl p-8 flex flex-col">
                    <h2 className="text-xl font-bold mb-1">Monthly</h2>
                    <div className="text-4xl font-black mb-6">
                        $4.99<span className="text-base font-normal text-gray-400">/mo</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                        {features.monthly.map(f => (
                            <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                                <span className="text-green-400 font-bold">✓</span> {f}
                            </li>
                        ))}
                    </ul>
                    <Link
                        href="/?upgrade=true&plan=monthly"
                        className="block text-center bg-white/10 border border-neonBlue text-white font-bold py-3 rounded-xl hover:bg-neonBlue/20 transition-colors"
                    >
                        Go Monthly
                    </Link>
                </div>

                {/* Yearly */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-neonPink/50 rounded-2xl p-8 flex flex-col relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neonPink text-white text-xs font-bold px-3 py-1 rounded-full">
                        BEST VALUE
                    </div>
                    <h2 className="text-xl font-bold mb-1">Yearly</h2>
                    <div className="text-4xl font-black mb-1">
                        $9.99<span className="text-base font-normal text-gray-400">/yr</span>
                    </div>
                    <div className="text-xs text-neonBlue font-mono mb-6">SAVE 83% vs Monthly</div>
                    <ul className="space-y-3 mb-8 flex-1">
                        {features.yearly.map(f => (
                            <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                                <span className="text-green-400 font-bold">✓</span> {f}
                            </li>
                        ))}
                    </ul>
                    <Link
                        href="/?upgrade=true&plan=yearly"
                        className="block text-center bg-gradient-to-r from-neonBlue to-neonPink text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
                    >
                        Go Yearly
                    </Link>
                </div>
            </div>

            {/* Introductory offer banner */}
            <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-center text-gray-300 text-sm max-w-xl">
                Introductory offer at $9.99/year — pricing may increase as the platform scales
            </div>

            {/* FAQ */}
            <div className="mt-16 max-w-2xl w-full space-y-6">
                <h2 className="text-xl font-bold text-center mb-8">Common questions</h2>
                {[
                    {
                        q: 'Can I really play for free?',
                        a: 'Yes. Playing against the AI is completely free, forever. No credit card needed.'
                    },
                    {
                        q: 'What does Premium unlock?',
                        a: 'Online multiplayer (challenge real players worldwide) and in-game chat.'
                    },
                    {
                        q: 'Why might the price increase?',
                        a: 'Running real-time multiplayer servers has ongoing costs. The $9.99/year rate is our introductory offer to early supporters — we\'ll honour it for existing subscribers.'
                    },
                    {
                        q: 'Can I cancel?',
                        a: 'Monthly subscribers can cancel anytime. Yearly plans are billed once per year.'
                    },
                ].map(({ q, a }) => (
                    <div key={q} className="border-b border-white/10 pb-6">
                        <p className="font-semibold text-white mb-2">{q}</p>
                        <p className="text-gray-400 text-sm">{a}</p>
                    </div>
                ))}
            </div>

            <p className="mt-12 text-gray-600 text-xs text-center">
                &copy; {new Date().getFullYear()} 3DBD. All rights reserved. &nbsp;
                <Link href="/terms" className="hover:text-gray-400">Terms</Link> &nbsp;·&nbsp;
                <Link href="/privacy" className="hover:text-gray-400">Privacy</Link>
            </p>
        </main>
    );
}
