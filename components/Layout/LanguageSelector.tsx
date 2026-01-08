
import { Globe } from 'lucide-react';
import { useTranslation, Language } from '@/lib/translations';

export function LanguageSelector() {
    const { language, setLanguage } = useTranslation();

    const languages: { code: Language; label: string; flag: string }[] = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'zh', label: '中文', flag: '🇨🇳' },
        { code: 'es', label: 'Español', flag: '🇪🇸' },
        { code: 'ja', label: '日本語', flag: '🇯🇵' },
        { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    ];

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 text-white/50 hover:text-white transition-colors p-2 rounded-lg" title="Change Language">
                <Globe size={20} />
                <span className="text-xs uppercase font-bold hidden md:block">{language}</span>
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-40 bg-[#111] border border-white/10 rounded-xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${language === lang.code ? 'text-neonBlue bg-white/5' : 'text-gray-400'}`}
                    >
                        <span className="text-lg">{lang.flag}</span>
                        {lang.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
