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
import { relations } from "drizzle-orm";
import { type AdapterAccount } from "next-auth/adapters";

export const users = pgTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    password: text("password"), // For Credentials Auth
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
    rating: integer("rating").default(1200),
    // Status
    status: text("status").$type<"online" | "offline" | "playing">().default("offline"),
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
    theme: text("theme").default('dark'), // Store the theme used for this game
});

export const chats = pgTable("chat", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    gameId: text("game_id").references(() => games.id, { onDelete: 'cascade' }),
    senderId: text("sender_id").references(() => users.id),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const friends = pgTable("friends", {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    friendId: text("friend_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    status: text("status").$type<'pending' | 'accepted' | 'blocked'>().default('pending').notNull(),
    createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
    pk: primaryKey({ columns: [t.userId, t.friendId] }),
}));

export const invites = pgTable("invites", {
    code: text("code").primaryKey(),
    referrerId: text("referrer_id").references(() => users.id),
    expiresAt: timestamp("expires_at").notNull(),
    usedCount: integer("used_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const challenges = pgTable("challenges", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    fromId: text("from_id").notNull(), // Guest ID or User ID
    fromName: text("from_name").notNull(),
    toId: text("to_id").references(() => users.id).notNull(),
    message: text("message"),
    status: text("status").$type<'pending' | 'accepted' | 'declined'>().default('pending'),
    gameId: text("game_id").references(() => games.id),
    createdAt: timestamp("created_at").defaultNow(),
});

// User Preferences Table
export const userPreferences = pgTable("user_preferences", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" })
        .unique(),
    showScoreboard: boolean("show_scoreboard").default(true).notNull(),
    showLeaderboard: boolean("show_leaderboard").default(true).notNull(),
    showTurnIndicator: boolean("show_turn_indicator").default(true).notNull(),
    boardScale: integer("board_scale").default(100).notNull(), // Store as percentage (100 = 1.0x)
    theme: text("theme").default("dark").notNull(),
    difficulty: text("difficulty").default("medium").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// RELATIONS
export const usersRelations = relations(users, ({ many }) => ({
    gamesAsWhite: many(games, { relationName: "whitePlayer" }),
    gamesAsBlack: many(games, { relationName: "blackPlayer" }),
    chats: many(chats),
    friends: many(friends, { relationName: "userFriends" }),
    invites: many(invites, { relationName: "userInvites" }),
    challengesAsRecipient: many(challenges, { relationName: "userChallenges" }),
}));

export const invitesRelations = relations(invites, ({ one }) => ({
    referrer: one(users, {
        fields: [invites.referrerId],
        references: [users.id],
        relationName: "userInvites"
    })
}));

export const challengesRelations = relations(challenges, ({ one }) => ({
    recipient: one(users, {
        fields: [challenges.toId],
        references: [users.id],
        relationName: "userChallenges"
    }),
    game: one(games, {
        fields: [challenges.gameId],
        references: [games.id]
    })
}));

export const friendsRelations = relations(friends, ({ one }) => ({
    user: one(users, {
        fields: [friends.userId],
        references: [users.id],
        relationName: "userFriends"
    }),
    friend: one(users, {
        fields: [friends.friendId],
        references: [users.id],
        relationName: "friendUser"
    })
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
    whitePlayer: one(users, {
        fields: [games.whitePlayerId],
        references: [users.id],
        relationName: "whitePlayer"
    }),
    blackPlayer: one(users, {
        fields: [games.blackPlayerId],
        references: [users.id],
        relationName: "blackPlayer"
    }),
    winner: one(users, {
        fields: [games.winnerId],
        references: [users.id],
    }),
    chats: many(chats),
}));

export const chatsRelations = relations(chats, ({ one }) => ({
    game: one(games, {
        fields: [chats.gameId],
        references: [games.id],
    }),
    sender: one(users, {
        fields: [chats.senderId],
        references: [users.id],
    }),
}));
