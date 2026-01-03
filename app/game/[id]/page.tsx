'use client';

import { useEffect, useState, useRef, use } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Board } from '@/components/Game/Board';
// import { GameUI } from '@/components/Game/GameUI';
import { Header } from '@/components/Layout/Header';
import { useGameStore } from '@/store/gameStore';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function MultiplayerGame({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const {
        setBoard,
        setCurrentPlayer,
        currentPlayer, // Corrected from currentTurn
        setWinner,
        preferences
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

                setGameData(data);
            }
        }, 2000); // 2s polling

        return () => clearInterval(interval);
    }, [id, setBoard, setCurrentPlayer]);

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
                {/* HUD */}
                <div className="absolute top-24 left-0 right-0 z-10 flex flex-col items-center pointer-events-none">
                    <div className="bg-white/10 p-4 rounded-xl text-white backdrop-blur-md pointer-events-auto border border-white/20">
                        <div className="text-xl font-black mb-2 flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${gameData.state.currentPlayer === 'white' ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-blue-500 shadow-[0_0_10px_blue]'}`}></div>
                            {gameData.state.currentPlayer === 'white' ? "Red's Turn" : "Blue's Turn"}
                        </div>
                        <div className="flex flex-col gap-1 text-xs text-gray-300 mb-2">
                            <div>🔴 P1 (Red): {gameData.players.white?.name || "Player 1"} {amIWhite ? "(YOU)" : ""}</div>
                            <div>🔵 P2 (Blue): {gameData.players.black?.name || "Waiting for P2..."} {amIBlack ? "(YOU)" : ""}</div>
                        </div>

                        {!isMyTurn && <div className="text-yellow-400 font-bold animate-pulse">Waiting for opponent...</div>}
                        {isMyTurn && <div className="text-green-400 font-bold tracking-wider"> YOUR TURN </div>}

                        <div className="mt-4 pt-4 border-t border-white/10 text-[10px] text-gray-500 flex justify-between items-center gap-4">
                            <span>ID: {id.slice(0, 6)}..</span>
                            <button onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert("Link Copied!");
                            }} className="text-neonBlue hover:text-white transition-colors uppercase font-bold tracking-widest">Copy Link</button>
                        </div>
                    </div>
                </div>

                <Canvas shadows>
                    <PerspectiveCamera makeDefault position={[0, 8, cameraZ]} fov={45} />
                    <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.2} />
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[5, 10, 5]} intensity={2} castShadow />

                    <SyncListener gameId={id} isMyTurn={isMyTurn} />
                    <Board />
                </Canvas>
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
