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

        fetch(`/api/games/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert("Game not found");
                    router.push('/');
                    return;
                }
                setGameData(data);

                // Sync Theme (Override local preference with Game's theme)
                if (data.theme && THEME_CONFIG[data.theme]) {
                    setTheme({
                        id: data.theme,
                        ...THEME_CONFIG[data.theme]
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
    useEffect(() => {
        const interval = setInterval(async () => {
            const res = await fetch(`/api/games/${id}`);
            const data = await res.json();

            if (data.state) {
                // Use the setters exposed in GameState
                setBoard(data.state.board);
                setCurrentPlayer(data.state.currentPlayer);
                // setWinner(data.state.winner); // Optional if tracked

                // Sync Scoreboard
                useGameStore.setState({
                    isAiEnabled: false,
                    scores: { white: data.whiteScore || 0, black: data.blackScore || 0 }
                });

                // Update Opponent Name
                if (data.players) {
                    const amIWhite = data.whitePlayerId === session?.user?.id;
                    const opponent = amIWhite ? data.players.black : data.players.white;
                    useGameStore.setState({
                        preferences: {
                            ...useGameStore.getState().preferences,
                            opponentName: opponent?.name || 'Waiting...'
                        }
                    });
                }

                setGameData(data);
            }
        }, 2000); // 2s polling

        return () => clearInterval(interval);
    }, [id, setBoard, setCurrentPlayer, session]);

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

                <Canvas shadows>
                    <PerspectiveCamera makeDefault position={[0, 8, cameraZ]} fov={45} />
                    <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.2} />
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
                    <ThemeBackground />

                    <SyncListener gameId={id} isMyTurn={isMyTurn} />
                    <Board />
                </Canvas>
                <ChatWindow gameId={id} />
            </main>
        </>
    );
}

// Component to listen to store changes and push to server
function SyncListener({ gameId, isMyTurn }: { gameId: string, isMyTurn: boolean }) {
    const { board, currentPlayer, scores, winner, setWinner } = useGameStore(); // Use scores object
    const previousBoard = useRef(board);
    const firstRun = useRef(true);

    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            return;
        }

        // Simple diff check (reference usually changes in Zustand on updates)
        if (board !== previousBoard.current) {
            if (isMyTurn) {
                console.log("Pushing move to server...");
                fetch(`/api/games/${gameId}`, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'move',
                        gameState: {
                            state: {
                                board: board,
                                currentPlayer: currentPlayer
                            },
                            // Extract scores from object
                            whiteScore: scores.white,
                            blackScore: scores.black,
                            winnerId: winner ? 'winner' : null
                        }
                    })
                });
            }
            previousBoard.current = board;
        }
    }, [board, currentPlayer, isMyTurn, gameId, scores, winner]);

    return null;
}
