import { create } from 'zustand';

export type Player = 'white' | 'black';
export type BoardState = (Player | null)[][][]; // [x][y][z] where z is height (0-3)

interface GameState {
    board: BoardState;
    currentPlayer: Player;
    winner: Player | 'draw' | null;
    moveHistory: { x: number; y: number; player: Player }[];
    scores: { white: number; black: number };
    isAiEnabled: boolean;

    // Actions
    resetGame: () => void;
    dropBead: (x: number, y: number) => void;
    checkWin: (board: BoardState) => Player | null; // Kept for compat, returns null now
    setAiEnabled: (enabled: boolean) => void;
    makeAiMove: () => void;
    evaluateBoard: (board: BoardState) => number;

    // Theme
    theme: {
        base: string;
        white: string;
        black: string;
        background: string;
    };
    setTheme: (theme: Partial<GameState['theme']>) => void;
}

// Helper to count lines for a player
const countLines = (board: BoardState, player: Player): number => {
    let count = 0;
    const size = 4;
    const lines: (Player | null)[][] = [];
    const addLine = (l: (Player | null)[]) => lines.push(l);

    // 1. Columns
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            const col: (Player | null)[] = [];
            for (let z = 0; z < size; z++) col.push(board[x][y][z]);
            addLine(col);
        }
    }

    // 2. Rows & Diagonals (Z-plane)
    for (let z = 0; z < size; z++) {
        for (let y = 0; y < size; y++) {
            const row: (Player | null)[] = [];
            for (let x = 0; x < size; x++) row.push(board[x][y][z]);
            addLine(row);
        }
        for (let x = 0; x < size; x++) {
            const row: (Player | null)[] = [];
            for (let y = 0; y < size; y++) row.push(board[x][y][z]);
            addLine(row);
        }
        // Diagonals
        const d1: (Player | null)[] = [], d2: (Player | null)[] = [];
        for (let i = 0; i < size; i++) {
            d1.push(board[i][i][z]);
            d2.push(board[i][size - 1 - i][z]);
        }
        addLine(d1); addLine(d2);
    }

    // 3. 3D Diagonals
    for (let i = 0; i < size; i++) {
        // X-Z plane at Y=i
        const d1: (Player | null)[] = [], d2: (Player | null)[] = [];
        for (let j = 0; j < size; j++) {
            d1.push(board[j][i][j]);
            d2.push(board[j][i][size - 1 - j]);
        }
        addLine(d1); addLine(d2);

        // Y-Z plane at X=i
        const d3: (Player | null)[] = [], d4: (Player | null)[] = [];
        for (let j = 0; j < size; j++) {
            d3.push(board[i][j][j]);
            d4.push(board[i][j][size - 1 - j]);
        }
        addLine(d3); addLine(d4);
    }

    // Pure 3D Cross Diagonals
    const d3d1: (Player | null)[] = [], d3d2: (Player | null)[] = [], d3d3: (Player | null)[] = [], d3d4: (Player | null)[] = [];
    for (let i = 0; i < size; i++) {
        d3d1.push(board[i][i][i]);
        d3d2.push(board[i][i][size - 1 - i]);
        d3d3.push(board[i][size - 1 - i][i]);
        d3d4.push(board[i][size - 1 - i][size - 1 - i]);
    }
    addLine(d3d1); addLine(d3d2); addLine(d3d3); addLine(d3d4);

    lines.forEach(line => {
        if (line.every(c => c === player)) count++;
    });

    return count;
};

export const useGameStore = create<GameState>((set, get) => ({
    board: Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null))),
    currentPlayer: 'white',
    winner: null,
    moveHistory: [],
    isAiEnabled: true,
    scores: { white: 0, black: 0 },
    theme: {
        base: '#222222',
        white: '#ffffff',
        black: '#333333',
        background: '#111111',
    },

    setTheme: (newTheme) => set((state) => ({ theme: { ...state.theme, ...newTheme } })),

    resetGame: () => set((state) => ({
        board: Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null))),
        currentPlayer: 'white',
        winner: null,
        moveHistory: [],
        scores: { white: 0, black: 0 }
    })),

    setAiEnabled: (enabled) => set({ isAiEnabled: enabled }),

    dropBead: (x, y) => {
        const { board, currentPlayer, winner, isAiEnabled } = get();
        if (winner) return;

        // Logic to find empty slot
        const newBoard = JSON.parse(JSON.stringify(board));
        const col = newBoard[x][y];
        const zIndex = col.findIndex((val: Player | null) => val === null);

        if (zIndex === -1) return; // Column full

        newBoard[x][y][zIndex] = currentPlayer;

        // Recalculate Scores
        const whiteScore = countLines(newBoard, 'white') * 4;
        const blackScore = countLines(newBoard, 'black') * 4;

        // Check for Game Over (Full Board)
        let isFull = true;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (newBoard[i][j].includes(null)) {
                    isFull = false;
                    break;
                }
            }
        }

        let newWinner: Player | 'draw' | null = null;
        if (isFull) {
            if (whiteScore > blackScore) newWinner = 'white';
            else if (blackScore > whiteScore) newWinner = 'black';
            else newWinner = 'draw';
        }

        set((state) => ({
            board: newBoard,
            currentPlayer: state.currentPlayer === 'white' ? 'black' : 'white',
            winner: newWinner,
            scores: { white: whiteScore, black: blackScore },
            moveHistory: [...state.moveHistory, { x, y, player: state.currentPlayer }]
        }));

        // Trigger AI if it's AI turn (Black) and game not over
        if (!newWinner && !isFull && isAiEnabled && currentPlayer === 'white') {
            setTimeout(() => get().makeAiMove(), 1500);
        }
    },

    evaluateBoard: (board: BoardState) => {
        // Heuristic: Difference in potential lines
        // We want to maximize our score and minimize opponent's
        // But simply counting lines is "actual score".
        // We need "potential score" too.

        // Simple hack: 
        // 4-in-row = 10000 (Current Score points)
        // 3-in-row = 100
        // 2-in-row = 10
        // Block opponent!

        let score = 0;
        // ... (reuse line logic or refactor out if we had time, for now simple inline approximation)
        // Actually, let's just use the current score difference + a small positional bonus
        const wScore = countLines(board, 'white') * 1000;
        const bScore = countLines(board, 'black') * 1000;

        return bScore - wScore; // AI is Black, so maximize Black - White
    },

    makeAiMove: () => {
        const { board, dropBead, winner, evaluateBoard } = get();
        if (winner) return;

        const MAX_DEPTH = 3;

        const getValidMoves = (b: BoardState) => {
            const moves = [];
            for (let x = 0; x < 4; x++) {
                for (let y = 0; y < 4; y++) {
                    if (b[x][y].some(c => c === null)) {
                        moves.push({ x, y });
                    }
                }
            }
            return moves;
        };

        const simulateMove = (b: BoardState, move: { x: number, y: number }, player: Player) => {
            const newBoard = JSON.parse(JSON.stringify(b));
            const z = newBoard[move.x][move.y].findIndex((c: any) => c === null);
            if (z !== -1) newBoard[move.x][move.y][z] = player;
            return newBoard;
        };

        const minimax = (b: BoardState, depth: number, alpha: number, beta: number, isMaximizing: boolean): number => {
            // Terminal node: Board full?
            // For now, just use depth limit.
            if (depth === 0) return evaluateBoard(b);

            const validMoves = getValidMoves(b);
            if (validMoves.length === 0) return evaluateBoard(b); // Game over naturally

            if (isMaximizing) {
                let maxEval = -Infinity;
                for (const move of validMoves) {
                    const newBoard = simulateMove(b, move, 'black');
                    const ev = minimax(newBoard, depth - 1, alpha, beta, false);
                    maxEval = Math.max(maxEval, ev);
                    alpha = Math.max(alpha, ev);
                    if (beta <= alpha) break;
                }
                return maxEval;
            } else {
                let minEval = Infinity;
                for (const move of validMoves) {
                    const newBoard = simulateMove(b, move, 'white');
                    const ev = minimax(newBoard, depth - 1, alpha, beta, true);
                    minEval = Math.min(minEval, ev);
                    beta = Math.min(beta, ev);
                    if (beta <= alpha) break;
                }
                return minEval;
            }
        };

        const validMoves = getValidMoves(board);
        if (validMoves.length === 0) return;

        let bestMove = validMoves[0];
        let maxEval = -Infinity;
        let alpha = -Infinity;
        let beta = Infinity;

        // Root search with randomness to break ties
        // Shuffle moves to avoid bias
        const shuffledMoves = validMoves.sort(() => Math.random() - 0.5);

        for (const move of shuffledMoves) {
            const newBoard = simulateMove(board, move, 'black');
            const ev = minimax(newBoard, MAX_DEPTH, alpha, beta, false);
            if (ev > maxEval) {
                maxEval = ev;
                bestMove = move;
            }
            alpha = Math.max(alpha, ev);
        }

        get().dropBead(bestMove.x, bestMove.y);
    },

    checkWin: () => null // Deprecated, unused but kept for interface until cleanup
}));

