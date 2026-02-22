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
import { THEME_CONFIG } from '@/lib/themeConfig';

// ---- Disconnect / Stale Modal -----------------------------------------------
function GameEndModal({ title, message, onContinue, onLeave }: {
    title: string;
    message: string;
    onContinue?: () => void;
    onLeave: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">
                <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
                <p className="text-gray-400 mb-6 leading-relaxed">{message}</p>
                <div className="flex gap-3 justify-center">
                    {onContinue && (
                        <button
                            onClick={onContinue}
                            className="px-6 py-2 bg-neonBlue text-black rounded-full font-bold hover:bg-white transition-colors"
                        >
                            Resume
                        </button>
                    )}
                    <button
                        onClick={onLeave}
                        className="px-6 py-2 bg-white/10 text-gray-300 rounded-full font-medium hover:bg-white/20 transition-colors"
                    >
                        Leave Game
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MultiplayerGame({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const {
        setBoard,
        setCurrentPlayer,
        currentPlayer,
        setWinner,
        preferences,
        setTheme,
    } = useGameStore();

    const router = useRouter();
    const { data: session } = useSession();
    const [gameData, setGameData] = useState<any>(null);
    const [isPlayer2, setIsPlayer2] = useState(false);

    // Disconnect / stale game modals
    const [disconnectModal, setDisconnectModal] = useState<{ title: string; message: string } | null>(null);
    const [staleModal, setStaleModal] = useState(false);

    // 1. Initial Load & Join Check
    useEffect(() => {
        if (!session) return;

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

                if (data.theme && THEME_CONFIG[data.theme as keyof typeof THEME_CONFIG]) {
                    setTheme({
                        id: data.theme,
                        ...THEME_CONFIG[data.theme as keyof typeof THEME_CONFIG]
                    });
                }

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

    // beforeunload — persist leave intent when closing tab / refreshing
    useEffect(() => {
        const handleUnload = () => {
            if (gameData && !gameData.isFinished) {
                // Use sendBeacon for reliability during page unload
                navigator.sendBeacon(`/api/games/${id}/leave`, JSON.stringify({}));
            }
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, [id, gameData]);

    // 2. Poll for Updates + Stale Game Detection
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting'>('connected');
    const lastHeartbeat = useRef(Date.now());
    const STALE_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour

    useEffect(() => {
        useGameStore.getState().setGameId(id);

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/games/${id}?t=${Date.now()}`);

                if (res.status === 401) return;

                const data = await res.json();
                setConnectionStatus('connected');
                lastHeartbeat.current = Date.now();

                // Stale game detection: active for >1hr and not finished
                if (!data.isFinished && data.updatedAt) {
                    const lastUpdate = new Date(data.updatedAt).getTime();
                    if (Date.now() - lastUpdate > STALE_THRESHOLD_MS) {
                        setStaleModal(true);
                    }
                }

                // If game was marked abandoned by server (opponent disconnected)
                if (data.status === 'abandoned' && !disconnectModal) {
                    const myId = session?.user?.id;
                    const iWon = data.winnerId === myId;
                    setDisconnectModal({
                        title: iWon ? '🏆 You Win!' : '⚠️ Game Over',
                        message: iWon
                            ? 'Your opponent disconnected. The game has been awarded to you.'
                            : 'You were disconnected and your opponent was awarded the win.'
                    });
                }

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

                    if (data.mode === 'ai' && !useGameStore.getState().isAiEnabled) {
                        useGameStore.setState({ isAiEnabled: true });
                    }

                    setGameData(data);
                }
            } catch (e) {
                console.error("Polling error", e);
                if (Date.now() - lastHeartbeat.current > 4000) {
                    setConnectionStatus('reconnecting');
                }
            }
        }, 1000);

        return () => {
            clearInterval(interval);
            useGameStore.getState().setGameId(null);
        };
    }, [id, session]);

    const handleLeaveGame = () => {
        fetch(`/api/games/${id}/leave`, { method: 'POST' }).finally(() => {
            router.push('/');
        });
    };

    const ConnectionBadge = () => (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${connectionStatus === 'connected' ? 'opacity-0 pointer-events-none' : 'opacity-100 bg-red-500 text-white animate-pulse'
            }`}>
            {connectionStatus === 'reconnecting' ? '⚠️ Reconnecting...' : ''}
        </div>
    );

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
                <GameUI />
                <div className="absolute top-24 left-0 right-0 z-10 flex flex-col items-center pointer-events-none">
                    {/* Banner removed */}
                </div>
                <ConnectionBadge />

                {/* Disconnect Modal */}
                {disconnectModal && (
                    <GameEndModal
                        title={disconnectModal.title}
                        message={disconnectModal.message}
                        onLeave={handleLeaveGame}
                    />
                )}

                {/* Stale Game Modal */}
                {staleModal && !disconnectModal && (
                    <GameEndModal
                        title="⏱️ Game Paused"
                        message="This game has been inactive for over an hour. Would you like to resume, or abandon it?"
                        onContinue={() => setStaleModal(false)}
                        onLeave={handleLeaveGame}
                    />
                )}

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

        if (board !== previousBoard.current) {
            const isLocalChange = !serverBoard || JSON.stringify(board) !== JSON.stringify(serverBoard);

            if (isMyTurn && isLocalChange) {
                console.log("SyncListener: Sending Move...", {
                    currentPlayer,
                    moveCount: moveHistory.length
                });

                fetch(`/api/games/${gameId}`, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'move',
                        gameState: {
                            state: {
                                board: board,
                                currentPlayer: currentPlayer,
                                winningCells: winningCells,
                                moveHistory: moveHistory
                            },
                            whiteScore: scores.white,
                            blackScore: scores.black,
                            winnerId: winner ? (currentPlayer === 'white' ? 'black' : 'white') : null
                        }
                    })
                }).catch(e => console.error("Sync Send Error:", e));
            }
            previousBoard.current = board;
        }
    }, [board, currentPlayer, isMyTurn, gameId, scores, winner, winningCells, moveHistory, serverBoard]);

    return null;
}
