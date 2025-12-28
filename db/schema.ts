import {
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    boolean,
    uuid,
    json,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

export const users = pgTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    plan: text("plan").$type<"free" | "premium">().default("free"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    points: integer("points").default(0).notNull(),
    wins: integer("wins").default(0).notNull(),
    losses: integer("losses").default(0).notNull(),
    lastSeen: timestamp("last_seen", { mode: "date" }),
    rankTier: text("rank_tier").default("bronze"),
    // Subscription Cache
    subscriptionStatus: text("subscription_status"),
    subscriptionEndDate: timestamp("subscription_end_date", { mode: "date" }),
    // Calculated Rating
    rating: integer("rating").default(0),
});

export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccount["type"]>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
);

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (verificationToken) => ({
        compositePk: primaryKey({
            columns: [verificationToken.identifier, verificationToken.token],
        }),
    })
);

// Game Specific Tables
export const games = pgTable("game", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    whitePlayerId: text("white_player_id").references(() => users.id),
    blackPlayerId: text("black_player_id").references(() => users.id),
    winnerId: text("winner_id").references(() => users.id),
    state: json("state").notNull(), // Stores the 4x4x4 board + currentTurn
    whiteScore: integer("white_score"),
    blackScore: integer("black_score"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    endedAt: timestamp("ended_at"),
    isFinished: boolean("is_finished").default(false),
    // Context
    difficulty: text("difficulty"), // 'easy', 'medium', 'hard'
    mode: text("mode").default('ai'), // 'ai', 'pvp'
});
