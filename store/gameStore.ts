import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { THEME_CONFIG } from '@/lib/themeConfig';

export type Player = 'white' | 'black';
export type BoardState = (Player | null)[][][]; // [x][y][z] where z is height (0-3)

interface Theme {
    id: string; // 'dark' | 'xmas' | 'easter' ...
    base: string;
    white: string;
    black: string;
    skin?: 'default' | 'tennis' | 'easter' | 'xmas' | 'wood' | 'rubik';
}

interface UserPreferences {
    showScoreboard: boolean;
    showLeaderboard: boolean;
    showTurnIndicator: boolean;
    boardScale: number;
    // beadSkin removed in favor of Theme.skin
    opponentName?: string;
    isLobbyVisible: boolean;
    language: 'en' | 'zh' | 'es' | 'ja' | 'hi';
    // Background Prefs
    backgroundMode: 'theme' | 'custom' | 'color';
    customBackgroundUrl: string | null;
    backgroundColor: string;
    reduceMotion: boolean;
    // Generic Advanced Theme Settings
    themeSpeed?: number; // 0.1 to 10
    themeDensity?: 'low' | 'medium' | 'high';
    themeEvents?: boolean; // "Hazards" or "Special Events"
    boardDrift?: boolean;  // New toggle for floating board effect
    soundVolume: number;   // 0 to 1
    musicVolume: number;   // 0 to 1
}

interface GameState {
    board: BoardState;
    currentPlayer: Player;
    winner: Player | 'draw' | null;
    moveHistory: { x: number; y: number; player: Player }[];
    isAiEnabled: boolean;
    scores: { white: number; black: number };
    winningCells: string[]; // "x-y-z"
    theme: Theme;
    preferences: UserPreferences;

    // Persistence
    gameId: string | null;
    lastSynced: number;

    // Actions
    resetGame: () => void;
    forceReset: () => void; // Hard reset including persistence keys if needed
    dropBead: (x: number, y: number) => void;
    checkWin: (board: BoardState) => Player | null;
    setAiEnabled: (enabled: boolean) => void;
    makeAiMove: () => void;
    setTheme: (theme: Partial<Theme>) => void;
    setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
    resetPreferences: () => void;
    setGameId: (id: string | null) => void;

    // Multiplayer Sync setters
    setBoard: (board: BoardState) => void;
    setCurrentPlayer: (player: Player) => void;
    setWinner: (winner: Player | 'draw' | null) => void;
    setScores: (scores: { white: number; black: number }) => void;
    // Robust Sync Action
    setSyncState: (serverState: Partial<GameState>) => void;

    // Rematch State
    rematchState: {
        requested: boolean; // Did *I* request it?
        opponentRequested: boolean; // Did *Opponent* request it?
        status: 'none' | 'pending' | 'accepted' | 'declined';
    };
    setRematchState: (state: Partial<{ requested: boolean; opponentRequested: boolean; status: 'none' | 'pending' | 'accepted' | 'declined' }>) => void;
}

const calculateScores = (board: BoardState): { white: number, black: number, winningCells: string[] } => {
    const size = 4;
    let wScore = 0;
    let bScore = 0;
    const winning: string[] = [];

    const checkLine = (cells: { val: Player | null, key: string }[]) => {
        if (cells.every(c => c.val === 'white')) {
            wScore++;
            cells.forEach(c => winning.push(c.key));
        }
        if (cells.every(c => c.val === 'black')) {
            bScore++;
            cells.forEach(c => winning.push(c.key));
        }
    };

    // 1. Vertical Columns
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            const col = [];
            for (let z = 0; z < size; z++) col.push({ val: board[x][y][z], key: `${x}-${y}-${z}` });
            checkLine(col);
        }
    }

    // 2. Horizontal Rows & Diagonals on Z-planes
    for (let z = 0; z < size; z++) {
        for (let y = 0; y < size; y++) {
            const row = [];
            for (let x = 0; x < size; x++) row.push({ val: board[x][y][z], key: `${x}-${y}-${z}` });
            checkLine(row);
        }
        for (let x = 0; x < size; x++) {
            const row = [];
            for (let y = 0; y < size; y++) row.push({ val: board[x][y][z], key: `${x}-${y}-${z}` });
            checkLine(row);
        }
        const d1 = [], d2 = [];
        for (let i = 0; i < size; i++) {
            d1.push({ val: board[i][i][z], key: `${i}-${i}-${z}` });
            d2.push({ val: board[i][size - 1 - i][z], key: `${i}-${size - 1 - i}-${z}` });
        }
        checkLine(d1);
        checkLine(d2);
    }

    // 3. 3D Diagonals
    for (let i = 0; i < size; i++) {
        const d1 = [], d2 = [];
        for (let j = 0; j < size; j++) {
            d1.push({ val: board[j][i][j], key: `${j}-${i}-${j}` });
            d2.push({ val: board[j][i][size - 1 - j], key: `${j}-${i}-${size - 1 - j}` });
        }
        checkLine(d1);
        checkLine(d2);

        const d3 = [], d4 = [];
        for (let j = 0; j < size; j++) {
            d3.push({ val: board[i][j][j], key: `${i}-${j}-${j}` });
            d4.push({ val: board[i][j][size - 1 - j], key: `${i}-${j}-${size - 1 - j}` });
        }
        checkLine(d3);
        checkLine(d4);
    }

    // Pure 3D Cross Diagonals
    const d3d1 = [], d3d2 = [], d3d3 = [], d3d4 = [];
    for (let i = 0; i < size; i++) {
        d3d1.push({ val: board[i][i][i], key: `${i}-${i}-${i}` });
        d3d2.push({ val: board[i][i][size - 1 - i], key: `${i}-${i}-${size - 1 - i}` });
        d3d3.push({ val: board[i][size - 1 - i][i], key: `${i}-${size - 1 - i}-${i}` });
        d3d4.push({ val: board[i][size - 1 - i][size - 1 - i], key: `${i}-${size - 1 - i}-${size - 1 - i}` });
    }
    checkLine(d3d1);
    checkLine(d3d2);
    checkLine(d3d3);
    checkLine(d3d4);

    return { white: wScore, black: bScore, winningCells: [...new Set(winning)] };
}

export const useGameStore = create<GameState & { difficulty: number, setDifficulty: (d: number) => void }>()(
    persist(
        (set, get) => ({
            board: Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null))),
            currentPlayer: 'white',
            winner: null,
            moveHistory: [],
            isAiEnabled: true,
            difficulty: 50, // Default to Medium (50/100)
            scores: { white: 0, black: 0 },
            winningCells: [],
            theme: {
                id: 'space',
                base: THEME_CONFIG.space.base,
                white: THEME_CONFIG.space.white,
                black: THEME_CONFIG.space.black,
                skin: THEME_CONFIG.space.skin
            },
            gameId: null,
            lastSynced: 0,
            preferences: {
                showScoreboard: true,
                showLeaderboard: true,
                showTurnIndicator: true,
                boardScale: 1.0,
                isLobbyVisible: true,
                language: 'en',
                backgroundMode: 'theme',
                customBackgroundUrl: null,
                backgroundColor: '#000000',
                reduceMotion: false,
                themeSpeed: 1,
                themeDensity: 'medium',
                themeEvents: true,
                boardDrift: true,
                soundVolume: 0.5,
                musicVolume: 0.3,
            },

            resetGame: () => set({
                board: Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null))),
                currentPlayer: 'white',
                winner: null,
                scores: { white: 0, black: 0 },
                winningCells: [],
                moveHistory: [],
                gameId: null,
                rematchState: { requested: false, opponentRequested: false, status: 'none' }, // Clear rematch state
                lastSynced: 0
            }),

            forceReset: () => {
                // Clear LOCAL state immediately
                set({
                    board: Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null))),
                    currentPlayer: 'white',
                    winner: null,
                    scores: { white: 0, black: 0 },
                    winningCells: [],
                    moveHistory: [],
                    gameId: null,
                    rematchState: { requested: false, opponentRequested: false, status: 'none' },
                    lastSynced: 0
                });
                // In a persisted store, `set` updates localStorage automatically.
                // However, if we need to nuking specific keys external to this store, do it here.
                localStorage.removeItem('guest_id'); // Optional: reset guest identity if issues persist? No, keep guest.
            },

            setAiEnabled: (enabled) => set({ isAiEnabled: enabled }),
            setDifficulty: (d) => set({ difficulty: d }),
            setTheme: (newTheme) => set((state) => ({ theme: { ...state.theme, ...newTheme } })),

            setPreference: (key, value) => set((state) => ({
                preferences: { ...state.preferences, [key]: value }
            })),

            setBoard: (board) => set({ board }),
            setCurrentPlayer: (player) => set({ currentPlayer: player }),
            setWinner: (winner) => set({ winner }),
            setScores: (scores) => set({ scores }),
            setGameId: (id) => set({ gameId: id }),

            setSyncState: (serverState) => {
                // SERVER AUTHORITY: Blindly accept server state.
                // We trust the server is the source of truth.
                // Any local "lag" or "optimistic" state that disagrees is overwritten.
                set((state) => ({ ...state, ...serverState }));
                return;
            },

            rematchState: { requested: false, opponentRequested: false, status: 'none' },
            setRematchState: (newState) => set((state) => ({ rematchState: { ...state.rematchState, ...newState } })),

            resetPreferences: () => set({
                preferences: {
                    showScoreboard: true,
                    showLeaderboard: true,
                    showTurnIndicator: true,
                    boardScale: 1.0,
                    isLobbyVisible: true,
                    language: 'en',
                    backgroundMode: 'theme',
                    customBackgroundUrl: null,
                    backgroundColor: '#000000',
                    reduceMotion: false,
                    themeSpeed: 1,
                    themeDensity: 'medium',
                    themeEvents: true,
                    boardDrift: true,
                    soundVolume: 0.5,
                    musicVolume: 0.3,
                }
            }),

            dropBead: (x, y) => {
                const { board, currentPlayer, winner, isAiEnabled, moveHistory } = get();
                if (winner) return;

                const newBoard = JSON.parse(JSON.stringify(board));
                const col = newBoard[x][y];
                const zIndex = col.findIndex((val: Player | null) => val === null);

                if (zIndex === -1) return; // Column full

                newBoard[x][y][zIndex] = currentPlayer;

                // Update Scores dynamically
                const { white, black, winningCells } = calculateScores(newBoard);
                const newScores = { white, black };

                // Check End Condition: 64 moves (Board Full)
                const totalMoves = moveHistory.length + 1;
                let newWinner: Player | 'draw' | null = null;

                if (totalMoves === 64) {
                    if (newScores.white > newScores.black) newWinner = 'white';
                    else if (newScores.black > newScores.white) newWinner = 'black';
                    else newWinner = 'draw';
                }

                set((state) => ({
                    board: newBoard,
                    currentPlayer: state.currentPlayer === 'white' ? 'black' : 'white',
                    winner: newWinner,
                    scores: newScores,
                    winningCells,
                    moveHistory: [...state.moveHistory, { x, y, player: state.currentPlayer }]
                }));

                if (!newWinner && isAiEnabled && currentPlayer === 'white') {
                    // Slight delay for AI feel
                    setTimeout(() => get().makeAiMove(), 500);
                }

                // ---------------------------------------------------------
                // PERSISTENCE (Release Drill)
                // Sync state to DB is now handled by the SyncListener component
                // in app/game/[id]/page.tsx to ensure full state (including history) is sent.
                // ---------------------------------------------------------
            },

            makeAiMove: () => {
                const { board, dropBead, winner, difficulty, scores } = get();
                if (winner) return;

                let validMoves: { x: number, y: number }[] = [];
                for (let x = 0; x < 4; x++) {
                    for (let y = 0; y < 4; y++) {
                        if (board[x][y].some(cell => cell === null)) {
                            validMoves.push({ x, y });
                        }
                    }
                }

                if (validMoves.length === 0) return;

                // Difficulty is now 0-100
                // Skill Check: Should the bot make a "Smart" move?
                // 0 = Always Random. 100 = Always Optimal (Win/Block).
                // Logic: 
                // 1. Can I win? (Priority 1)
                // 2. Must I block? (Priority 2)
                // 3. Random

                // Effective Difficulty can be nonlinear? Linear is fine for now.
                // At 100, we ALWAYS see the win/block.
                // At 50, we miss it half the time.
                const isLucid = Math.random() * 100 < (Number(difficulty) || 50);

                let bestMove = validMoves[Math.floor(Math.random() * validMoves.length)];

                if (isLucid) {
                    // 1. Check for Immediate Win
                    for (const move of validMoves) {
                        const newBoard = JSON.parse(JSON.stringify(board));
                        const col = newBoard[move.x][move.y];
                        const z = col.findIndex((val: Player | null) => val === null);
                        newBoard[move.x][move.y][z] = 'black'; // Bot (AI is usually black/P2 in local)

                        const { black } = calculateScores(newBoard);
                        if (black > scores.black) {
                            // Found a winning move! Take it immediately.
                            get().dropBead(move.x, move.y);
                            return;
                        }
                    }

                    // 2. Check for Essential Block
                    for (const move of validMoves) {
                        const newBoard = JSON.parse(JSON.stringify(board));
                        const col = newBoard[move.x][move.y];
                        const z = col.findIndex((val: Player | null) => val === null);
                        newBoard[move.x][move.y][z] = 'white'; // Opponent

                        const { white } = calculateScores(newBoard);
                        if (white > scores.white) {
                            // If I don't go here, they score. I MUST Block.
                            bestMove = move;
                            get().dropBead(bestMove.x, bestMove.y);
                            return;
                        }
                    }
                }

                // Execute (Best Found or Random)
                get().dropBead(bestMove.x, bestMove.y);
            },

            checkWin: () => {
                const { board, scores } = get();
                // Re-run calculation to be safe
                const { white, black } = calculateScores(board);
                if (white > black && (white + black >= 64)) return 'white'; // Simple majority at end?
                // Actually 4-in-a-row is different than the score-based logic? 
                // Ah, looking at calculateScores, it counts winning LINES (wScore++). Use that.
                if (white > black) return 'white'; // If we define win by lines?
                // Wait, the game logic seems to be "Most Lines".
                return null;
            }
        }),
        {
            name: '3dbd-storage-v2', // Updated branding to 3DBD - v2 to Clear Cache
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                theme: state.theme,
                // Removed isAiEnabled from persistence to ensure mode is set by Server/URL
                preferences: state.preferences,
            }),
            // Migrate from old storage key if exists
            migrate: (persistedState: any, version: number) => {
                // Default new fields
                if (persistedState && persistedState.preferences) {

                    // Migrate String Difficulty to Number
                    if (typeof persistedState.difficulty === 'string') {
                        const map: any = { 'easy': 20, 'medium': 50, 'hard': 90 };
                        persistedState.difficulty = map[persistedState.difficulty] || 50;
                    }
                    if (typeof persistedState.preferences.difficulty === 'string') {
                        const map: any = { 'easy': 20, 'medium': 50, 'hard': 90 };
                        persistedState.preferences.difficulty = map[persistedState.preferences.difficulty] || 50;
                    }

                    if (persistedState.preferences.isLobbyVisible === undefined) {
                        persistedState.preferences.isLobbyVisible = true;
                    }

                    // Migrate Space Settings to Generic Theme Settings
                    if (persistedState.preferences.themeSpeed === undefined) {
                        persistedState.preferences.themeSpeed = persistedState.preferences.spaceSpeed ?? 1;
                    }
                    if (persistedState.preferences.themeDensity === undefined) {
                        persistedState.preferences.themeDensity = persistedState.preferences.spaceDensity ?? 'medium';
                    }
                    if (persistedState.preferences.themeEvents === undefined) {
                        persistedState.preferences.themeEvents = persistedState.preferences.spaceHazards ?? true;
                    }
                    if (persistedState.preferences.boardDrift === undefined) {
                        persistedState.preferences.boardDrift = true;
                    }

                    if (!persistedState.preferences.backgroundMode) {
                        persistedState.preferences.backgroundMode = 'theme';
                    }
                    if (persistedState.preferences.reduceMotion === undefined) {
                        persistedState.preferences.reduceMotion = false;
                    }
                    if (!persistedState.preferences.backgroundColor) {
                        persistedState.preferences.backgroundColor = '#000000';
                    }
                }

                return persistedState;
            }
        }
    )
);
