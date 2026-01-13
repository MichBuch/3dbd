'use client';

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { THEME_CONFIG } from "./SettingsPanel";

export const PreferenceSync = () => {
    const { data: session } = useSession();
    const { preferences, theme, setPreference, setTheme } = useGameStore();

    const isFirstLoad = useRef(true);
    const saveTimeout = useRef<NodeJS.Timeout>();

    // 1. Load on Login
    useEffect(() => {
        if (!session?.user) return;

        const loadPrefs = async () => {
            try {
                const res = await fetch('/api/user/preferences');
                if (!res.ok) return;
                const data = await res.json();

                if (data && Object.keys(data).length > 0) {
                    console.log("Cloud Save: Loaded", data);

                    // Restore Theme
                    if (data.activeThemeId && THEME_CONFIG[data.activeThemeId]) {
                        // Need to construct full theme object if stored as ID
                        const cfg = THEME_CONFIG[data.activeThemeId];
                        setTheme({
                            id: data.activeThemeId,
                            base: cfg.base,
                            white: cfg.white,
                            black: cfg.black,
                            skin: cfg.skin
                        });
                    }

                    // Restore Preferences
                    if (data.prefs) {
                        Object.entries(data.prefs).forEach(([k, v]) => {
                            // @ts-ignore
                            setPreference(k, v);
                        });
                    }
                }
            } catch (err) {
                console.error("Cloud Save: Load Failed", err);
            } finally {
                isFirstLoad.current = false;
            }
        };

        if (isFirstLoad.current) {
            loadPrefs();
        }
    }, [session?.user]); // Run when user becomes available

    // 2. Save on Change (Debounced)
    useEffect(() => {
        if (!session?.user || isFirstLoad.current) return;

        // Clear existing
        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        // Debounce Save (2s)
        saveTimeout.current = setTimeout(async () => {
            const payload = {
                activeThemeId: theme.id,
                prefs: preferences
            };

            try {
                await fetch('/api/user/preferences', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                console.log("Cloud Save: Saved");
            } catch (err) {
                console.error("Cloud Save: Save Failed", err);
            }
        }, 2000);

        return () => {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
        };
    }, [preferences, theme, session?.user]);

    return null; // Headless component
};
