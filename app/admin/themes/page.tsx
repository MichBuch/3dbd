import { auth } from '@/auth';
import { db } from '@/db';
import { users, systemSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getThemeAssets } from '@/app/actions/admin';
import Link from 'next/link';
import { UploadClient } from './UploadClient';
import { MusicManager } from './MusicManager';

export default async function AdminThemesPage() {
    const session = await auth();
    if (!session?.user?.email) redirect('/');

    const user = await db.query.users.findFirst({
        where: eq(users.email, session.user.email),
        columns: { admin: true }
    });

    if (!user?.admin) redirect('/');

    // Parallel Fetch
    const [assets, settings] = await Promise.all([
        getThemeAssets(),
        db.select().from(systemSettings)
    ]);

    // Transform Settings
    const settingsMap = settings.reduce((acc, curr) => ({
        ...acc,
        [curr.key]: curr.value
    }), {} as Record<string, string>);

    // Hardcoded list from SettingsPanel
    const themes = [
        'beach', 'black_white', 'chinese_new_year', 'diwali', 'xmas', 'dark',
        'easter', 'halloween', 'rubik', 'snow', 'space', 'starry', 'tennis',
        'winter', 'wood', 'area51', 'cozy', 'padel', 'pickleball', 'rugby', 'toys', 'route66'
    ];
    // Note: Added missing themes from THEME_CONFIG to be safe

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            <h1 className="text-3xl font-bold mb-2 text-neonBlue">Theme Management</h1>
            <p className="text-gray-400 mb-8">Manage visual assets and background music for game themes.</p>

            <Link href="/" className="mb-8 block text-gray-400 hover:text-white">&larr; Back to Game</Link>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-neonPink flex items-center gap-2">
                    <span className="text-xl">🎵</span> Theme Music
                </h2>
                <MusicManager initialSettings={settingsMap} />
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4 text-green-400 flex items-center gap-2">
                    <span className="text-xl">🖼️</span> Visual Assets
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {themes.map(themeId => {
                        const activeAsset = assets.find(a => a.themeId === themeId && a.isActive);
                        return (
                            <div key={themeId} className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
                                <h2 className="text-xl font-bold capitalize mb-4">{themeId.replace(/_/g, ' ')}</h2>

                                {activeAsset ? (
                                    <div className="mb-4">
                                        <p className="text-xs text-green-500 mb-2">Active Asset:</p>
                                        {activeAsset.type === 'image' ? (
                                            <img src={activeAsset.url} alt={themeId} className="w-full h-32 object-cover rounded-lg" />
                                        ) : (
                                            <div className="w-full h-32 bg-gray-800 flex items-center justify-center rounded-lg">Video</div>
                                        )}
                                        <p className="text-[10px] text-gray-500 mt-1 truncate">{activeAsset.url}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 mb-4">No custom asset (using default/CSS)</p>
                                )}

                                <UploadClient themeId={themeId} />
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
