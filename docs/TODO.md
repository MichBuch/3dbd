# Project Tasks & Progress

<!-- id: task-list -->
- [x] Fix `createTennisTexture` error in `Bead.tsx` <!-- id: 0 -->
    - [x] Implement `createTennisTexture` function <!-- id: 1 -->
    - [x] Verify fix <!-- id: 2 -->
- [x] Fix `LobbyDashboard.tsx` import error <!-- id: 3 -->
- [x] Implement Overlay Clearing <!-- id: 4 -->
    - [x] Update `gameStore.ts` with `isLobbyVisible` <!-- id: 5 -->
    - [x] Update `app/page.tsx` to respect `isLobbyVisible` <!-- id: 6 -->
    - [x] Add "X" close button to `LobbyDashboard.tsx` <!-- id: 7 -->
- [x] Implement Phase 1: Scalable Lobby <!-- id: 8 -->
    - [x] Add `friends` table to Schema (Additive) <!-- id: 9 -->
    - [x] Update `LobbyDashboard` with Search & Filter UI <!-- id: 10 -->
    - [x] Update `/api/lobby` to support filtering (Backwards Compatible) <!-- id: 11 -->
    - [x] Verify Demo Stability <!-- id: 12 -->
- [x] Implement Friend System (Phase 1 Continued) <!-- id: 13 -->
    - [x] Create `/api/friends` endpoints (Add/Remove/List) <!-- id: 14 -->
    - [x] Update `LobbyDashboard` with "Add Friend" button <!-- id: 15 -->
    - [x] Update `LobbyDashboard` with "Friends" tab <!-- id: 16 -->
- [x] Implement Phase 2: Viral Growth <!-- id: 17 -->
    - [x] Create `invites` table in Schema <!-- id: 18 -->
    - [x] Create `/api/invites` endpoints (Generate/Validate) <!-- id: 19 -->
    - [x] Create Invite Landing Page `/invite/[code]` <!-- id: 20 -->
    - [x] Add "Invite Friend" button to Header <!-- id: 21 -->
- [x] Refine UX & Strings <!-- id: 22 -->
    - [x] Hide "Make Friends" prompt for guests in `LobbyDashboard` <!-- id: 23 -->
    - [x] Implement Collapsible Sections in `SettingsPanel` <!-- id: 24 -->
    - [x] Verify Chat Functionality <!-- id: 25 -->
- [x] Implement Guest Challenge System <!-- id: 26 -->
    - [x] Add `challenges` table to Schema <!-- id: 27 -->
    - [x] Create `/api/challenges` endpoints <!-- id: 28 -->
    - [x] Update `LobbyDashboard` for Guest Challenge UI <!-- id: 29 -->

- [ ] Implement Phase 3: Infrastructure Scaling <!-- id: 30 -->
    - [x] Upgrade Node.js Environment (v20+) & Fix Peer Depends <!-- id: 31 -->
    - [ ] Implement SWR (Stale-While-Revalidate) for Lobby <!-- id: 32 -->
    - [ ] Implement Adaptive Polling (Slow down when idle) <!-- id: 33 -->
