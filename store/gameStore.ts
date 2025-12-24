import { create } from 'zustand';

export type Player = 'white' | 'black';
export type BoardState = (Player | null)[][][]; // [x][y][z] where z is height (0-3)

interface GameState {
    board: BoardState;
    currentPlayer: Player;
    winner: Player | 'draw' | null;
    moveHistory: { x: number; y: number; player: Player }[];
    isAiEnabled: boolean;

    // Actions
    resetGame: () => void;
    dropBead: (x: number, y: number) => void;
    checkWin: (board: BoardState) => Player | null;
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


const checkWin = (board: BoardState): Player | null => {
    const size = 4;

    // Helper to check a line of cells
    const checkLine = (cells: (Player | null)[]): Player | null => {
        if (cells.every(c => c === 'white')) return 'white';
        if (cells.every(c => c === 'black')) return 'black';
        return null;
    };

    // 1. Vertical Columns (Fixed x, y, varying z)
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            const col: (Player | null)[] = [];
            for (let z = 0; z < size; z++) col.push(board[x][y][z]);
            const res = checkLine(col);
            if (res) return res;
        }
    }

    // 2. Horizontal Rows (Fixed z, y, varying x) & (Fixed z, x, varying y)
    for (let z = 0; z < size; z++) {
        // Rows along X
        for (let y = 0; y < size; y++) {
            const row: (Player | null)[] = [];
            for (let x = 0; x < size; x++) row.push(board[x][y][z]);
            const res = checkLine(row);
            if (res) return res;
        }
        // Rows along Y
        for (let x = 0; x < size; x++) {
            const row: (Player | null)[] = [];
            for (let y = 0; y < size; y++) row.push(board[x][y][z]);
            const res = checkLine(row);
            if (res) return res;
        }

        // Diagonals on the Z-plane
        const d1: (Player | null)[] = [], d2: (Player | null)[] = [];
        for (let i = 0; i < size; i++) {
            d1.push(board[i][i][z]);
            d2.push(board[i][size - 1 - i][z]);
        }
        if (checkLine(d1)) return checkLine(d1);
        if (checkLine(d2)) return checkLine(d2);
    }

    // 3. 3D Diagonals
    // Vertical Plane Diagonals
    for (let i = 0; i < size; i++) {
        // X-Z plane at Y=i
        const d1: (Player | null)[] = [], d2: (Player | null)[] = [];
        for (let j = 0; j < size; j++) {
            d1.push(board[j][i][j]);
            d2.push(board[j][i][size - 1 - j]);
        }
        if (checkLine(d1)) return checkLine(d1);
        if (checkLine(d2)) return checkLine(d2);

        // Y-Z plane at X=i
        const d3: (Player | null)[] = [], d4: (Player | null)[] = [];
        for (let j = 0; j < size; j++) {
            d3.push(board[i][j][j]);
            d4.push(board[i][j][size - 1 - j]);
        }
        if (checkLine(d3)) return checkLine(d3);
        if (checkLine(d4)) return checkLine(d4);
    }

    // Pure 3D Cross Diagonals
    const d3d1: (Player | null)[] = [], d3d2: (Player | null)[] = [], d3d3: (Player | null)[] = [], d3d4: (Player | null)[] = [];
    for (let i = 0; i < size; i++) {
        d3d1.push(board[i][i][i]); // 0,0,0 -> 3,3,3
        d3d2.push(board[i][i][size - 1 - i]); // 0,0,3 -> 3,3,0
        d3d3.push(board[i][size - 1 - i][i]); // 0,3,0 -> 3,0,3
        d3d4.push(board[i][size - 1 - i][size - 1 - i]); // 0,3,3 -> 3,0,0
    }
    if (checkLine(d3d1)) return checkLine(d3d1);
    if (checkLine(d3d2)) return checkLine(d3d2);
    if (checkLine(d3d3)) return checkLine(d3d3);
    if (checkLine(d3d4)) return checkLine(d3d4);

    return null;
}

export const useGameStore = create<GameState>((set, get) => ({
    board: Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null))),
    currentPlayer: 'white',
    winner: null,
    moveHistory: [],
    isAiEnabled: true, // Default to true for now
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
        moveHistory: []
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
        const win = checkWin(newBoard);

        set((state) => ({
            board: newBoard,
            currentPlayer: state.currentPlayer === 'white' ? 'black' : 'white',
            winner: win,
            moveHistory: [...state.moveHistory, { x, y, player: state.currentPlayer }]
        }));

        // Trigger AI if it's AI turn (Black) and game not over
        if (!win && isAiEnabled && currentPlayer === 'white') {
            setTimeout(() => get().makeAiMove(), 1500);
        }
    },

    // --- AI Logic (Minimax) ---

    // Simple heuristic evaluation
    evaluateBoard: (board: BoardState) => {
        let score = 0;
        const size = 4;
        const lines: (Player | null)[][] = [];

        // Gather all lines (reuse logic from checkWin roughly, or just reimplement for scoring)
        // For efficiency, we'll traverse and push lines to an array to score them.
        // NOTE: In a strictly optimized engine, we'd do this inline.

        // Helpers to grab lines
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

        // Scoring function for a line
        const scoreLine = (line: (Player | null)[]) => {
            const whiteCount = line.filter(c => c === 'white').length;
            const blackCount = line.filter(c => c === 'black').length;

            if (blackCount > 0 && whiteCount > 0) return 0; // Blocked line

            if (blackCount === 4) return 100000;
            if (blackCount === 3) return 1000;
            if (blackCount === 2) return 100;
            if (blackCount === 1) return 10;

            if (whiteCount === 4) return -100000;
            if (whiteCount === 3) return -1000; // Block opponent win!
            if (whiteCount === 2) return -100;
            if (whiteCount === 1) return -10;

            return 0;
        };

        lines.forEach(line => score += scoreLine(line));
        return score;
    },

    makeAiMove: () => {
        const { board, dropBead, winner, evaluateBoard, checkWin } = get();
        if (winner) return;

        // Configuration
        const MAX_DEPTH = 3; // Keep low for browser performance

        // 1. Get valid moves
        const getValidMoves = (b: BoardState) => {
            const moves = [];
            for (let x = 0; x < 4; x++) {
                for (let y = 0; y < 4; y++) {
                    // Check if column is full (topmost cell)
                    // Actually we need to find the first null from bottom. 
                    // But for validity we just need to know if the top (z=3) is empty? 
                    // No, "drop" mechanic fills first available Z. So move is valid if any Z is null.
                    if (b[x][y].some(c => c === null)) {
                        moves.push({ x, y });
                    }
                }
            }
            return moves;
        };

        // 2. Simulate Move Helper
        const simulateMove = (b: BoardState, move: { x: number, y: number }, player: Player) => {
            // Deep copy (expensive but safe for MVP)
            const newBoard = JSON.parse(JSON.stringify(b));
            const z = newBoard[move.x][move.y].findIndex((c: any) => c === null);
            if (z !== -1) newBoard[move.x][move.y][z] = player;
            return newBoard;
        };

        // 3. Minimax Function
        const minimax = (b: BoardState, depth: number, alpha: number, beta: number, isMaximizing: boolean): number => {
            const win = checkWin(b);
            if (win === 'black') return 100000 - (MAX_DEPTH - depth); // Prefer faster wins
            if (win === 'white') return -100000 + (MAX_DEPTH - depth); // Prefer slower losses
            if (depth === 0) return evaluateBoard(b);

            const validMoves = getValidMoves(b);
            if (validMoves.length === 0) return 0; // Draw

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

        // 4. Execution
        const validMoves = getValidMoves(board);
        if (validMoves.length === 0) return;

        let bestMove = validMoves[0];
        let maxEval = -Infinity;
        let alpha = -Infinity;
        let beta = Infinity;

        // Root level
        for (const move of validMoves) {
            const newBoard = simulateMove(board, move, 'black');
            // If this move wins instantly, take it!
            if (checkWin(newBoard) === 'black') {
                bestMove = move;
                break;
            }

            // Otherwise search
            const ev = minimax(newBoard, MAX_DEPTH, alpha, beta, false);
            if (ev > maxEval) {
                maxEval = ev;
                bestMove = move;
            }
            alpha = Math.max(alpha, ev);
        }

        // Execute best move
        get().dropBead(bestMove.x, bestMove.y);
    },

    checkWin: checkWin
}));

