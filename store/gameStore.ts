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

    resetGame: () => set({
        board: Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null))),
        currentPlayer: 'white',
        winner: null,
        moveHistory: []
    }),

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
            setTimeout(() => get().makeAiMove(), 500);
        }
    },

    // Quick and dirty AI integration in the store for now
    makeAiMove: () => {
        const { board, dropBead, winner } = get();
        if (winner) return;

        // SImple Random AI for MVP
        let validMoves = [];
        for (let x = 0; x < 4; x++) {
            for (let y = 0; y < 4; y++) {
                if (board[x][y].some(cell => cell === null)) {
                    validMoves.push({ x, y });
                }
            }
        }

        if (validMoves.length > 0) {
            const move = validMoves[Math.floor(Math.random() * validMoves.length)];
            // We can't call dropBead directly because it toggles player. 
            // We need to ensure we are dropping as AI.
            // Actually dropBead handles toggling, so if we call it, it will place for 'black' (current player) and toggle to 'white'.
            get().dropBead(move.x, move.y);
        }
    }
}));
