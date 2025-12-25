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
    winningCells: string[]; // "x-y-z"
    theme: Theme;

    // Actions
    resetGame: () => void;
    dropBead: (x: number, y: number) => void;
    checkWin: (board: BoardState) => Player | null;
    setAiEnabled: (enabled: boolean) => void;
    makeAiMove: () => void;
    setTheme: (theme: Partial<Theme>) => void;
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

export const useGameStore = create<GameState & { difficulty: 'easy' | 'medium' | 'hard', setDifficulty: (d: 'easy' | 'medium' | 'hard') => void }>()(
    persist(
        (set, get) => ({
            board: Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null))),
            currentPlayer: 'white',
            winner: null,
            moveHistory: [],
            isAiEnabled: true,
            difficulty: 'hard',
            scores: { white: 0, black: 0 },
            winningCells: [],
            // Xmas Default: Red (White Player) & Green (Black Player)
            theme: { base: '#222222', white: '#ff0000', black: '#00ff00' },

            resetGame: () => set({
                board: Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null))),
                currentPlayer: 'white',
                winner: null,
                scores: { white: 0, black: 0 },
                winningCells: [],
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
                    setTimeout(() => get().makeAiMove(), 500);
                }
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

                let bestMove = validMoves[Math.floor(Math.random() * validMoves.length)];

                // On Hard/Medium, try to find better moves
                if (difficulty === 'medium' || difficulty === 'hard') {
                    // 1. Try to Score
                    for (const move of validMoves) {
                        const newBoard = JSON.parse(JSON.stringify(board));
                        const col = newBoard[move.x][move.y];
                        const z = col.findIndex((val: Player | null) => val === null);
                        newBoard[move.x][move.y][z] = 'black'; // AI

                        const { black } = calculateScores(newBoard);
                        if (black > scores.black) {
                            bestMove = move;
                            get().dropBead(bestMove.x, bestMove.y);
                            return;
                        }
                    }
                    // 2. Try to Block (Only Hard)
                    if (difficulty === 'hard') {
                        for (const move of validMoves) {
                            const newBoard = JSON.parse(JSON.stringify(board));
                            const col = newBoard[move.x][move.y];
                            const z = col.findIndex((val: Player | null) => val === null);
                            newBoard[move.x][move.y][z] = 'white'; // Opponent

                            const { white } = calculateScores(newBoard);
                            if (white > scores.white) {
                                bestMove = move;
                                get().dropBead(bestMove.x, bestMove.y);
                                return;
                            }
                        }
                    }
                }

                // Execute
                get().dropBead(bestMove.x, bestMove.y);
            },

            checkWin: () => null
        }),
        {
            name: '3dbd-storage-v2', // New key to force reset and valid defaults
            partialize: (state) => ({ theme: state.theme, isAiEnabled: state.isAiEnabled, difficulty: state.difficulty }),
        }
    )
);
