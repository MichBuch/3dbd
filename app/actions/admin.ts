'use server';

import { auth } from '@/auth';
import { db } from '@/db';
import { themeAssets, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function isAdmin() {
    const session = await auth();
    if (!session?.user?.email) return false;

    // Check role in DB
    const user = await db.query.users.findFirst({
        where: eq(users.email, session.user.email),
        columns: { admin: true }
    });

    return !!user?.admin;
}

export async function upsertThemeAsset(themeId: string, url: string, type: 'image' | 'video') {
    if (!await isAdmin()) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Deactivate old assets for this theme
        // Actually, we might want multiple assets per theme? 
        // For now, let's assume one active background per theme.
        await db.update(themeAssets)
            .set({ isActive: false })
            .where(eq(themeAssets.themeId, themeId));

        // Insert new
        await db.insert(themeAssets).values({
            themeId,
            url,
            type,
            isActive: true
        });

        revalidatePath('/admin/themes');
        return { success: true };
    } catch (error) {
        console.error("Asset upsert error", error);
        return { success: false, error: "Database error" };
    }
}

export async function getThemeAssets() {
    // Unsecured read is fine for now, or check admin if strict
    // We want the game to read this too potentially.
    // For admin page, we just list all.
    const assets = await db.query.themeAssets.findMany({
        orderBy: (themeAssets, { desc }) => [desc(themeAssets.createdAt)]
    });
    return assets;
}
