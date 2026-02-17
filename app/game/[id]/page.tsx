'use client';

import { useEffect, useState, useRef, use } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Board } from '@/components/Game/Board';
import { GameUI } from '@/components/Game/GameUI';
import { Header } from '@/components/Layout/Header';
import { useGameStore } from '@/store/gameStore';
import { ChatWindow } from '@/components/Game/ChatWindow';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ThemeBackground } from '@/components/Game/ThemeBackground';
import { THEME_CONFIG } from '@/lib/themeConfig'; // Import Theme Config

export default function MultiplayerGame({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const {
        setBoard,
        setCurrentPlayer,
        currentPlayer, // Corrected from currentTurn
        setWinner,
        preferences,
        setTheme, // Add setTheme
    } = useGameStore();

    const router = useRouter();
    const { data: session } = useSession();
    const [gameData, setGameData] = useState<any>(null);
    const [isPlayer2, setIsPlayer2] = useState(false);

    // 1. Initial Load & Join Check
    useEffect(() => {
        if (!session) return;

        // Reset Store if entering a new game ID
        // This prevents "Ghost Beads" from previous games appearing
        if (useGameStore.getState().gameId !== id) {
            useGameStore.getState().resetGame();
            useGameStore.getState().setGameId(id);
        }

        fetch(`/api/games/${id}?t=${Date.now()}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert("Game not found");
                    router.push('/');
                    return;
                }
                setGameData(data);

                // Sync Theme (Override local preference with Game's theme)
                if (data.theme && THEME_CONFIG[data.theme as keyof typeof THEME_CONFIG]) {
                    setTheme({
                        id: data.theme,
                        ...THEME_CONFIG[data.theme as keyof typeof THEME_CONFIG]
                    });
                }

                // IMMEDIATE STATE SYNC (Rehydrate Store from Server immediately)
                if (data.state) {
                    const myRole = data.whitePlayerId === session?.user?.id ? 'white' : 'black';
                    const opponentRole = myRole === 'white' ? 'black' : 'white';
                    const votes = data.state.rematchVotes || {};

                    useGameStore.getState().setSyncState({
                        board: data.state.board,
                        currentPlayer: data.state.currentPlayer,
                        winner: data.winnerId ? (data.winnerId === data.whitePlayerId ? 'white' : data.winnerId === data.blackPlayerId ? 'black' : 'draw') : null,
                        scores: { white: data.whiteScore || 0, black: data.blackScore || 0 },
                        winningCells: data.state.winningCells || [],
                        // FORCE AI Disabled if mode is PvP, regardless of what server state says or defaults
                        isAiEnabled: data.mode === 'ai',
                        rematchState: {
                            requested: votes[myRole] || false,
                            opponentRequested: votes[opponentRole] || false,
                            status: (votes.white && votes.black) ? 'accepted' : (votes[myRole] ? 'pending' : 'none')
                        },
                        preferences: {
                            ...useGameStore.getState().preferences,
                            opponentName: (data.whitePlayerId === session?.user?.id
                                ? data.players?.black?.name
                                : data.players?.white?.name) || 'Waiting...'
                        },
                        moveHistory: data.state.moveHistory || []
                    });
                }

                // If I am not White, and Black is empty, Try to Join
                if (data.whitePlayerId !== session.user?.id && !data.blackPlayerId) {
                    joinGame();
                }
            });
    }, [id, session]);

    const joinGame = async () => {
        const res = await fetch(`/api/games/${id}`, {
            method: 'POST',
            body: JSON.stringify({ action: 'join' })
        });
        const data = await res.json();
        if (data.success) {
            setIsPlayer2(true);
            alert("You joined as Player 2!");
        }
    };

    // 2. Poll for Updates
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting'>('connected');
    const lastHeartbeat = useRef(Date.now());

    useEffect(() => {
        // Set Game ID for Global Listener (Busy Status)
        useGameStore.getState().setGameId(id);

        const interval = setInterval(async () => {
            try {
                const startTime = Date.now();
                const res = await fetch(`/api/games/${id}?t=${Date.now()}`);

                if (res.status === 401) {
                    // Session expired?
                    return;
                }

                const data = await res.json();
                setConnectionStatus('connected');
                lastHeartbeat.current = Date.now();

                if (data.state) {
                    const myRole = data.whitePlayerId === session?.user?.id ? 'white' : 'black';
                    const opponentRole = myRole === 'white' ? 'black' : 'white';
                    const votes = data.state.rematchVotes || {};

                    // Use Robust Sync Action
                    useGameStore.getState().setSyncState({
                        board: data.state.board,
                        currentPlayer: data.state.currentPlayer,
                        // Only sync winner if we aren't already locally aware (to avoid flicker) or if it CLEARED (rematch)
                        winner: data.winnerId ? (data.winnerId === data.whitePlayerId ? 'white' : data.winnerId === data.blackPlayerId ? 'black' : 'draw') : null,
                        scores: { white: data.whiteScore || 0, black: data.blackScore || 0 },
                        winningCells: data.state.winningCells || [],
                        isAiEnabled: data.mode === 'ai',

                        // Sync Rematch State
                        rematchState: {
                            requested: votes[myRole] || false,
                            opponentRequested: votes[opponentRole] || false,
                            status: (votes.white && votes.black) ? 'accepted' : (votes[myRole] ? 'pending' : 'none')
                        },

                        preferences: {
                            ...useGameStore.getState().preferences,
                            opponentName: (data.whitePlayerId === session?.user?.id
                                ? data.players?.black?.name
                                : data.players?.white?.name) || 'Waiting...'
                        },

                        // Pass Move History for Version Check
                        moveHistory: data.state.moveHistory || []
                    });

                    // Detect Bot Takeover
                    if (data.mode === 'ai' && !useGameStore.getState().isAiEnabled) {
                        useGameStore.setState({ isAiEnabled: true });
                        // Optionally notify user via Toast?
                        // For now, the game just continues seamlessly.
                    }

                    setGameData(data);
                }
            } catch (e) {
                console.error("Polling error", e);
                // If persistent error > 3s
                if (Date.now() - lastHeartbeat.current > 4000) {
                    setConnectionStatus('reconnecting');
                }
            }
        }, 1000); // Optimized to 1s polling

        return () => {
            clearInterval(interval);
            // Clear Busy Status on Exit
            useGameStore.getState().setGameId(null);
        };
    }, [id, session]);

    // Connection Badge Component (Inline)
    const ConnectionBadge = () => (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${connectionStatus === 'connected' ? 'opacity-0 pointer-events-none' : 'opacity-100 bg-red-500 text-white animate-pulse'
            }`}>
            {connectionStatus === 'reconnecting' ? '⚠️ Reconnecting...' : ''}
        </div>
    );

    // Camera
    const baseCameraDistance = 12;
    const cameraZ = baseCameraDistance / preferences.boardScale;

    if (!gameData) return <div className="text-white p-10 font-mono">Loading Game Board...</div>;

    const amIWhite = gameData.whitePlayerId === session?.user?.id;
    const amIBlack = gameData.blackPlayerId === session?.user?.id;
    const isMyTurn = (gameData.state.currentPlayer === 'white' && amIWhite) ||
        (gameData.state.currentPlayer === 'black' && amIBlack);

    return (
        <>
            <Header />
            <main className="relative bg-black h-screen w-screen overflow-hidden">
                {/* HUD Replaced by GameUI */}
                <GameUI />
                <div className="absolute top-24 left-0 right-0 z-10 flex flex-col items-center pointer-events-none">
                    {/* Banner removed */}
                </div>
                <ConnectionBadge />

                <Canvas shadows>
                    <PerspectiveCamera makeDefault position={[0, 8, cameraZ]} fov={45} />
                    <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.2} />
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
                    <ThemeBackground />

                    <SyncListener
                        gameId={id}
                        isMyTurn={isMyTurn}
                        serverBoard={gameData?.state?.board}
                    />
                    <Board />
                </Canvas>
                <ChatWindow gameId={id} />
            </main>
        </>
    );
}

// Component to listen to store changes and push to server
function SyncListener({ gameId, isMyTurn, serverBoard }: { gameId: string, isMyTurn: boolean, serverBoard: any }) {
    const { board, currentPlayer, scores, winner, winningCells, moveHistory } = useGameStore();
    const previousBoard = useRef(board);
    const firstRun = useRef(true);

    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            return;
        }

        // Simple diff check (reference usually changes in Zustand on updates)
        if (board !== previousBoard.current) {
            // Echo Prevention: Only send move if local board differs from Last Known Server Board
            // If they match, it means we just synced FROM the server.
            // Using fast JSON stringify for deep compare (Board is small: 4x4x4 integers)
            const isLocalChange = !serverBoard || JSON.stringify(board) !== JSON.stringify(serverBoard);

            if (isMyTurn && isLocalChange) {
                console.log("SyncListener: Sending Move...", {
                    currentPlayer,
                    moveCount: moveHistory.length
                });

                // Pushing move to server
                fetch(`/api/games/${gameId}`, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'move',
                        gameState: {
                            state: {
                                board: board,
                                currentPlayer: currentPlayer,
                                winningCells: winningCells, // Push winning cells
                                moveHistory: moveHistory // Push move history
                            },
                            // Extract scores from object
                            whiteScore: scores.white,
                            blackScore: scores.black,
                            winnerId: winner ? (currentPlayer === 'white' ? 'black' : 'white') : null // (Store already flipped)
                        }
                    })
                }).catch(e => console.error("Sync Send Error:", e));
            }
            previousBoard.current = board;
        }
    }, [board, currentPlayer, isMyTurn, gameId, scores, winner, winningCells, moveHistory, serverBoard]);

    return null;
}
