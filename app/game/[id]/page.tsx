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
import { getSocket } from '@/lib/socketClient';

// ── Premium gate ──────────────────────────────────────────────────────────────
function PremiumGate({ onClose }: { onClose: () => void }) {
    const router = useRouter();
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                <div className="text-5xl mb-4">🎮</div>
                <h2 className="text-2xl font-bold text-white mb-2">Premium Feature</h2>
                <p className="text-gray-400 mb-2 leading-relaxed">
                    Online multiplayer and in-game chat require a Premium subscription.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                    Play vs the computer for free, or upgrade to challenge real players worldwide.
                </p>
                <div className="bg-gradient-to-r from-neonBlue/10 to-neonPink/10 border border-white/10 rounded-xl p-4 mb-6">
                    <div className="text-3xl font-black text-white">$9.99<span className="text-base font-normal text-gray-400">/year</span></div>
                    <div className="text-xs text-neonBlue mt-1 font-mono uppercase tracking-wider">Introductory offer — price may increase as we scale</div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-white/10 text-gray-300 rounded-xl font-medium hover:bg-white/20 transition-colors"
                    >
                        Play vs AI
                    </button>
                    <button
                        onClick={() => router.push('/?upgrade=true')}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-neonBlue to-neonPink text-black rounded-xl font-bold hover:opacity-90 transition-opacity"
                    >
                        Upgrade Now
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Game end modal ────────────────────────────────────────────────────────────
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
                        <button onClick={onContinue} className="px-6 py-2 bg-neonBlue text-black rounded-full font-bold hover:bg-white transition-colors">
                            Resume
                        </button>
                    )}
                    <button onClick={onLeave} className="px-6 py-2 bg-white/10 text-gray-300 rounded-full font-medium hover:bg-white/20 transition-colors">
                        Leave Game
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main game page ────────────────────────────────────────────────────────────
export default function MultiplayerGame({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { preferences, setTheme } = useGameStore();

    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();
    const [gameData, setGameData] = useState<any>(null);
    const [disconnectModal, setDisconnectModal] = useState<{ title: string; message: string } | null>(null);
    const [staleModal, setStaleModal] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting'>('connected');
    const [showPremiumGate, setShowPremiumGate] = useState(false);
    const [gameMode, setGameMode] = useState<string | null>(null);
    const lastHeartbeat = useRef(Date.now());
    const pollBackoff = useRef(1000);
    const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const STALE_THRESHOLD_MS = 60 * 60 * 1000;

    // ── Premium check ─────────────────────────────────────────────────────────
    const isPremium = (session?.user as any)?.plan === 'premium';

    // Fetch game mode early so we can gate only pvp games
    useEffect(() => {
        if (sessionStatus === 'loading') return;
        if (!session) { setShowPremiumGate(true); return; }
        fetch(`/api/games/${id}?t=${Date.now()}`)
            .then(r => r.json())
            .then(data => {
                const mode = data?.mode || 'pvp';
                setGameMode(mode);
                // Only gate multiplayer — AI is free
                if (mode === 'pvp' && !isPremium) {
                    setShowPremiumGate(true);
                }
            })
            .catch(() => {
                if (!isPremium) setShowPremiumGate(true);
            });
    }, [sessionStatus, session, isPremium, id]);

    // ── Socket: join game room for real-time events (pvp only) ───────────────
    useEffect(() => {
        if (!session?.user?.id || !isPremium || gameMode !== 'pvp') return;

        const socket = getSocket();
        if (!socket) return;

        // Join the socket room so we receive real-time events
        const joinRoom = () => {
            socket.emit('join-game', { gameId: id, userId: session.user!.id });
        };

        if (socket.connected) {
            joinRoom();
        } else {
            socket.once('connect', joinRoom);
        }

        // Real-time game state updates (moves from opponent)
        const onGameStateUpdate = (data: any) => {
            if (!data?.state) return;
            const myRole = gameData?.whitePlayerId === session.user!.id ? 'white' : 'black';
            const opponentRole = myRole === 'white' ? 'black' : 'white';
            const votes = data.state.rematchVotes || {};
            useGameStore.getState().setSyncState({
                board: data.state.board,
                currentPlayer: data.state.currentPlayer,
                winner: data.winnerId ? (data.winnerId === gameData?.whitePlayerId ? 'white' : 'black') : null,
                scores: { white: data.whiteScore || 0, black: data.blackScore || 0 },
                winningCells: data.state.winningCells || [],
                isAiEnabled: false,
                rematchState: {
                    requested: votes[myRole] || false,
                    opponentRequested: votes[opponentRole] || false,
                    status: (votes.white && votes.black) ? 'accepted' : (votes[myRole] ? 'pending' : 'none')
                },
                preferences: useGameStore.getState().preferences,
                moveHistory: data.state.moveHistory || []
            });
        };

        // Opponent disconnected
        const onPlayerDisconnected = ({ userId }: { userId: string }) => {
            if (userId !== session.user!.id) {
                setConnectionStatus('reconnecting');
            }
        };

        // Opponent reconnected
        const onPlayerReconnected = ({ userId }: { userId: string }) => {
            if (userId !== session.user!.id) {
                setConnectionStatus('connected');
            }
        };

        // Game abandoned (disconnect timer expired)
        const onGameAbandoned = ({ winnerId }: { winnerId: string }) => {
            const iWon = winnerId === session.user!.id;
            setDisconnectModal({
                title: iWon ? '🏆 You Win!' : '⚠️ Game Over',
                message: iWon
                    ? 'Your opponent disconnected. The game has been awarded to you.'
                    : 'You were disconnected and your opponent was awarded the win.'
            });
        };

        // Game reset (rematch accepted)
        const onGameReset = ({ newStarter }: { newStarter: string }) => {
            const newBoard = Array(4).fill(null).map(() => Array(4).fill(null).map(() => Array(4).fill(null)));
            useGameStore.getState().setSyncState({
                board: newBoard,
                currentPlayer: newStarter as 'white' | 'black',
                winner: null,
                scores: useGameStore.getState().scores,
                winningCells: [],
                isAiEnabled: false,
                rematchState: { requested: false, opponentRequested: false, status: 'none' },
                preferences: useGameStore.getState().preferences,
                moveHistory: []
            });
        };

        socket.on('game-state-update', onGameStateUpdate);
        socket.on('player-disconnected', onPlayerDisconnected);
        socket.on('player-reconnected', onPlayerReconnected);
        socket.on('game-abandoned', onGameAbandoned);
        socket.on('game-reset', onGameReset);

        return () => {
            socket.emit('leave-game', { gameId: id });
            socket.off('connect', joinRoom);
            socket.off('game-state-update', onGameStateUpdate);
            socket.off('player-disconnected', onPlayerDisconnected);
            socket.off('player-reconnected', onPlayerReconnected);
            socket.off('game-abandoned', onGameAbandoned);
            socket.off('game-reset', onGameReset);
        };
    }, [id, session, isPremium, gameMode, gameData?.whitePlayerId]);

    // ── Initial load & join ───────────────────────────────────────────────────
    useEffect(() => {
        if (!session) return;

        if (useGameStore.getState().gameId !== id) {
            useGameStore.getState().resetGame();
            useGameStore.getState().setGameId(id);
        }

        fetch(`/api/games/${id}?t=${Date.now()}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) { router.push('/'); return; }
                setGameData(data);

                if (data.theme && THEME_CONFIG[data.theme as keyof typeof THEME_CONFIG]) {
                    setTheme({ id: data.theme, ...THEME_CONFIG[data.theme as keyof typeof THEME_CONFIG] });
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
                            opponentName: (data.whitePlayerId === session?.user?.id ? data.players?.black?.name : data.players?.white?.name) || 'Waiting...'
                        },
                        moveHistory: data.state.moveHistory || []
                    });
                }

                if (data.whitePlayerId !== session.user?.id && !data.blackPlayerId) {
                    fetch(`/api/games/${id}`, { method: 'POST', body: JSON.stringify({ action: 'join' }) });
                }
            });
    }, [id, session, isPremium]);

    // ── beforeunload ──────────────────────────────────────────────────────────
    useEffect(() => {
        const handleUnload = () => {
            if (gameData && !gameData.isFinished) {
                navigator.sendBeacon(`/api/games/${id}/leave`, JSON.stringify({}));
            }
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, [id, gameData]);

    // ── Polling with exponential backoff ──────────────────────────────────────
    useEffect(() => {
        if (!session) return;
        useGameStore.getState().setGameId(id);

        const poll = async () => {
            try {
                const res = await fetch(`/api/games/${id}?t=${Date.now()}`);
                if (res.status === 401) { pollTimer.current = setTimeout(poll, 1000); return; }

                const data = await res.json();
                setConnectionStatus('connected');
                lastHeartbeat.current = Date.now();
                pollBackoff.current = 1000;

                if (!data.isFinished && data.updatedAt) {
                    const lastUpdate = new Date(data.updatedAt).getTime();
                    if (Date.now() - lastUpdate > STALE_THRESHOLD_MS) setStaleModal(true);
                }

                if (data.status === 'abandoned' && !disconnectModal) {
                    const iWon = data.winnerId === session?.user?.id;
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
                            opponentName: (data.whitePlayerId === session?.user?.id ? data.players?.black?.name : data.players?.white?.name) || 'Waiting...'
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
                if (Date.now() - lastHeartbeat.current > 4000) setConnectionStatus('reconnecting');
                pollBackoff.current = Math.min(pollBackoff.current * 2, 16000);
            }
            pollTimer.current = setTimeout(poll, pollBackoff.current);
        };

        poll();
        return () => {
            if (pollTimer.current) clearTimeout(pollTimer.current);
            useGameStore.getState().setGameId(null);
        };
    }, [id, session]);

    const handleLeaveGame = () => {
        fetch(`/api/games/${id}/leave`, { method: 'POST' }).finally(() => router.push('/'));
    };

    const ConnectionBadge = () => (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${connectionStatus === 'connected' ? 'opacity-0 pointer-events-none' : 'opacity-100 bg-red-500 text-white animate-pulse'}`}>
            {connectionStatus === 'reconnecting' ? '⚠️ Reconnecting...' : ''}
        </div>
    );

    const baseCameraDistance = 12;
    const cameraZ = baseCameraDistance / preferences.boardScale;

    // Show premium gate before anything else
    if (showPremiumGate) {
        return (
            <PremiumGate onClose={() => router.push('/')} />
        );
    }

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
                <ConnectionBadge />

                {disconnectModal && (
                    <GameEndModal title={disconnectModal.title} message={disconnectModal.message} onLeave={handleLeaveGame} />
                )}

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
                    <SyncListener gameId={id} isMyTurn={isMyTurn} serverBoard={gameData?.state?.board} />
                    <Board />
                </Canvas>

                {/* Chat only for premium */}
                <ChatWindow gameId={id} isPremium={isPremium} />
            </main>
        </>
    );
}

// ── SyncListener ──────────────────────────────────────────────────────────────
function SyncListener({ gameId, isMyTurn, serverBoard }: { gameId: string, isMyTurn: boolean, serverBoard: any }) {
    const { board, currentPlayer, scores, winner, winningCells, moveHistory } = useGameStore();
    const previousBoard = useRef(board);
    const firstRun = useRef(true);

    useEffect(() => {
        if (firstRun.current) { firstRun.current = false; return; }

        if (board !== previousBoard.current) {
            const isLocalChange = !serverBoard || JSON.stringify(board) !== JSON.stringify(serverBoard);

            if (isMyTurn && isLocalChange) {
                const boardSnapshot = board;
                const prevBoardSnapshot = previousBoard.current;

                fetch(`/api/games/${gameId}`, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'move',
                        gameState: {
                            state: { board: boardSnapshot, currentPlayer, winningCells, moveHistory },
                            whiteScore: scores.white,
                            blackScore: scores.black,
                            winnerId: winner ? (currentPlayer === 'white' ? 'black' : 'white') : null
                        }
                    })
                }).then(async (res) => {
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        console.warn("Move rejected, rolling back:", err.error);
                        if (prevBoardSnapshot) {
                            useGameStore.getState().setSyncState({
                                board: prevBoardSnapshot,
                                currentPlayer: currentPlayer === 'white' ? 'black' : 'white',
                                winner: null,
                                scores,
                                winningCells: [],
                                isAiEnabled: useGameStore.getState().isAiEnabled,
                                rematchState: useGameStore.getState().rematchState,
                                preferences: useGameStore.getState().preferences,
                                moveHistory: moveHistory.slice(0, -1)
                            });
                        }
                    }
                }).catch(e => console.error("Sync Send Error:", e));
            }
            previousBoard.current = board;
        }
    }, [board, currentPlayer, isMyTurn, gameId, scores, winner, winningCells, moveHistory, serverBoard]);

    return null;
}
