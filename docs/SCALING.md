# Scaling Roadmap: 0 to 100,000 Users

This roadmap outlines the technical and product evolution required to support 100,000 active users over the next 12 months.

## Phase 1: Lobby & Social Filtering (Months 1-3)
**Goal:** Prevent lobby overcrowding and improve user connection.

### 1. Lobby Pagination & Filtering
- **Current State:** Returns *all* online users active in last 60s. This will crash the UI with >100 users.
- **Action:**
    - Implement infinite scroll or pagination (limit 50 users/page).
    - Add Filters: `Friends Only`, `Skill Rating (±200 ELO)`, `Recent Opponents`.
    - Add Search: Find users by name.

### 2. Social Graph Implementation
- **Action:**
    - Create `friends` table (user_id_a, user_id_b, status).
    - Create `recent_opponents` redis cache (TTL 3 days) for quick "Rematch" prompts.
    - Implement "Add Friend" button in Game Over screen and User Profile.

### 3. Matchmaking Queue (Auto-Match)
- **Problem:** Browsing a list works for 10 users, not 10,000.
- **Action:**
    - Add "Quick Play" button.
    - Server-side matchmaking logic: Pairs players based on ELO rating range.
    - Users enter a "Queue" pool instead of just sitting in the lobby list.

## Phase 2: Viral Growth Mechanics (Months 3-6)
**Goal:** Leverage user base to acquire new users organically.

### 1. 24-Hour Guest Pass
- **Action:**
    - Generate unique invite links: `3dbd.com/invite/uuid`.
    - Invitees get a "Guest" account with Premium features for 24h.
    - **Incentive:** If the guest subscribes, the referrer gets 1 month of Premium free.

### 2. Sharable Replays (GIF/Video)
- **Action:**
    - Auto-generate a GIF of the winning move (4x4x4 connect).
    - One-click share to Twitter/Discord/TikTok with a "Challenge Me" deep link.

## Phase 3: Infrastructure Scaling (Months 6-12)
**Goal:** Ensure 99.9% uptime with heavy concurrency.

### 1. Environment & Dependencies
- **Problem:** Current Node.js version (v18) is deprecated by key dependencies (`next@16`, `nodemailer@7`).
- **Action:**
    - Upgrade Runtime to Node.js v20 (LTS) or v22.
    - Resolve peer dependency warnings.

### 2. Optimized Polling (Architecture Decision)
- **Decision:** Stick to Polling for now to simplify Vercel deployment (avoiding custom servers).
- **Optimization Strategy:**
    - **SWR / React Query:** Implement "stale-while-revalidate" to prevent UI flickering and intelligent re-fetching.
    - **Adaptive Polling:** Slow down polling (e.g., 5s -> 30s) when the window is blurred or user is idle.
    - **Future Migration:** WebSockets (Pusher) remains the target for >50k users or when real-time latency is critical (<100ms).

### 3. Database Read Replicas & Caching
- **Problem:** `GET /api/lobby` hits the DB every 5 seconds per user. 10k users = 2000 req/sec (too high for single Postgres).
- **Action:**
    - **Redis Layer:** Cache the "Online Users List" and "Open Games" for 1-2 seconds.
    - **Read Replicas:** Scale Postgres with read replicas for `GET` requests.

## Proposed Schema Changes

### database/schema.ts
```typescript
export const friends = pgTable("friends", {
    userId: text("user_id").references(() => users.id),
    friendId: text("friend_id").references(() => users.id),
    status: text("status").$type<'pending' | 'accepted' | 'blocked'>(),
    createdAt: timestamp("created_at").defaultNow()
});

export const invites = pgTable("invites", {
    code: text("code").primaryKey(),
    referrerId: text("referrer_id").references(() => users.id),
    usedBy: text("used_by"), // ID of user who claimed it
    expiresAt: timestamp("expires_at").notNull()
});
```
