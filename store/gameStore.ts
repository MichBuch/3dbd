import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Player = 'white' | 'black';
export type BoardState = (Player | null)[][][]; // [x][y][z] where z is height (0-3)

interface Theme {
    base: string;
    white: string;
    black: string;
}

interface GameState {
    board: BoardState;
    currentPlayer: Player;
    winner: Player | 'draw' | null;
    moveHistory: { x: number; y: number; player: Player }[];
    isAiEnabled: boolean;
    scores: { white: number; black: number };
    theme: Theme;

    // Actions
    resetGame: () => void;
    dropBead: (x: number, y: number) => void;
    checkWin: (board: BoardState) => Player | null;
    setAiEnabled: (enabled: boolean) => void;
    makeAiMove: () => void;
    setTheme: (theme: Partial<Theme>) => void;
}

const calculateScores = (board: BoardState): { white: number, black: number } => {
    const size = 4;
    let wScore = 0;
    let bScore = 0;

    const checkLine = (cells: (Player | null)[]) => {
        if (cells.every(c => c === 'white')) wScore++;
        if (cells.every(c => c === 'black')) bScore++;
    };

    // 1. Vertical Columns
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            const col: (Player | null)[] = [];
            for (let z = 0; z < size; z++) col.push(board[x][y][z]);
            checkLine(col);
        }
    }

    // 2. Horizontal Rows & Diagonals on Z-planes
    for (let z = 0; z < size; z++) {
        for (let y = 0; y < size; y++) {
            const row: (Player | null)[] = [];
            for (let x = 0; x < size; x++) row.push(board[x][y][z]);
            checkLine(row);
        }
        for (let x = 0; x < size; x++) {
            const row: (Player | null)[] = [];
            for (let y = 0; y < size; y++) row.push(board[x][y][z]);
            checkLine(row);
        }
        const d1: (Player | null)[] = [], d2: (Player | null)[] = [];
        for (let i = 0; i < size; i++) {
            d1.push(board[i][i][z]);
            d2.push(board[i][size - 1 - i][z]);
        }
        checkLine(d1);
        checkLine(d2);
    }

    // 3. 3D Diagonals
    for (let i = 0; i < size; i++) {
        const d1: (Player | null)[] = [], d2: (Player | null)[] = [];
        for (let j = 0; j < size; j++) {
            d1.push(board[j][i][j]);
            d2.push(board[j][i][size - 1 - j]);
        }
        checkLine(d1);
        checkLine(d2);

        const d3: (Player | null)[] = [], d4: (Player | null)[] = [];
        for (let j = 0; j < size; j++) {
            d3.push(board[i][j][j]);
            d4.push(board[i][j][size - 1 - j]);
        }
        checkLine(d3);
        checkLine(d4);
    }

    // Pure 3D Cross Diagonals
    const d3d1: (Player | null)[] = [], d3d2: (Player | null)[] = [], d3d3: (Player | null)[] = [], d3d4: (Player | null)[] = [];
    for (let i = 0; i < size; i++) {
        d3d1.push(board[i][i][i]);
        d3d2.push(board[i][i][size - 1 - i]);
        d3d3.push(board[i][size - 1 - i][i]);
        d3d4.push(board[i][size - 1 - i][size - 1 - i]);
    }
    checkLine(d3d1);
    checkLine(d3d2);
    checkLine(d3d3);
    checkLine(d3d4);

    return { white: wScore, black: bScore };
}

export const useGameStore = create<GameState & { difficulty: 'easy' | 'medium' | 'hard', setDifficulty: (d: 'easy' | 'medium' | 'hard') => void }>()(
    persist(
        (set, get) => ({
            board: Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null))),
            currentPlayer: 'white',
            winner: null,
            moveHistory: [],
            isAiEnabled: true,
            difficulty: 'medium',
            scores: { white: 0, black: 0 },
            // Xmas Default: Red (White Player) & Green (Black Player)
            theme: { base: '#222222', white: '#ff0000', black: '#00ff00' },

            resetGame: () => set({
                board: Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null))),
                currentPlayer: 'white',
                winner: null,
                scores: { white: 0, black: 0 },
                moveHistory: []
            }),

            setAiEnabled: (enabled) => set({ isAiEnabled: enabled }),
            setDifficulty: (d) => set({ difficulty: d }),
            setTheme: (newTheme) => set((state) => ({ theme: { ...state.theme, ...newTheme } })),

            dropBead: (x, y) => {
                const { board, currentPlayer, winner, isAiEnabled, moveHistory } = get();
                if (winner) return;

                const newBoard = JSON.parse(JSON.stringify(board));
                const col = newBoard[x][y];
                const zIndex = col.findIndex((val: Player | null) => val === null);

                if (zIndex === -1) return; // Column full

                newBoard[x][y][zIndex] = currentPlayer;

                // Update Scores dynamically
                const newScores = calculateScores(newBoard);

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
                    moveHistory: [...state.moveHistory, { x, y, player: state.currentPlayer }]
                }));

                if (!newWinner && isAiEnabled && currentPlayer === 'white') {
                    setTimeout(() => get().makeAiMove(), 500);
                }
            },

            makeAiMove: () => {
                const { board, dropBead, winner, difficulty } = get();
                if (winner) return;

                let validMoves = [];
                for (let x = 0; x < 4; x++) {
                    for (let y = 0; y < 4; y++) {
                        if (board[x][y].some(cell => cell === null)) {
                            validMoves.push({ x, y });
                        }
                    }
                }

                if (validMoves.length > 0) {
                    // Hard: 20% randomness (mostly tactical - blocking logic implied but random for MVP + bias)
                    // Medium: 50% randomness
                    // Easy: 100% randomness

                    // For now, MVP implementation of difficulty is purely chance-based "Best Move" stub
                    // In a real Minimax, we'd limit depth based on difficulty.
                    // Here we just pick random for now as placeholder for "AI Logic"
                    const move = validMoves[Math.floor(Math.random() * validMoves.length)];
                    get().dropBead(move.x, move.y);
                }
            },

            checkWin: () => null
        }),
        {
            name: '3dbd-storage',
            partialize: (state) => ({ theme: state.theme, isAiEnabled: state.isAiEnabled, difficulty: state.difficulty }),
        }
    )
);
