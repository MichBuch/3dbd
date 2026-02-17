'use client';

import { useGameStore } from '@/store/gameStore';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Procedural Lines Component
const CourtLines = ({ type, color }: { type: string, color: string }) => {
    // Generate line segments based on sport
    const lines = useMemo(() => {
        const segments: { start: [number, number], end: [number, number] }[] = [];

        // Helper to add rect
        const addRect = (w: number, h: number, x: number = 0, y: number = 0) => {
            const hw = w / 2;
            const hh = h / 2;
            segments.push(
                { start: [x - hw, y - hh], end: [x + hw, y - hh] },
                { start: [x + hw, y - hh], end: [x + hw, y + hh] },
                { start: [x + hw, y + hh], end: [x - hw, y + hh] },
                { start: [x - hw, y + hh], end: [x - hw, y - hh] }
            );
        };

        if (type === 'tennis') {
            // Standard Tennis Court Scale (approx)
            addRect(36, 78); // Singles/Doubles outer approx
            addRect(27, 78); // Singles lines
            addRect(27, 42); // Service boxes
            // Center service line
            segments.push({ start: [0, -21], end: [0, 21] });
        } else if (type === 'pickleball' || type === 'padel') {
            // Smaller court
            addRect(20, 44);
            // Kitchen/Service
            segments.push({ start: [-10, 0], end: [10, 0] }); // Net line
            segments.push({ start: [-10, 7], end: [10, 7] }); // Kitchen line (approx)
            segments.push({ start: [-10, -7], end: [10, -7] });
            segments.push({ start: [0, 7], end: [0, 22] }); // Center line top
            segments.push({ start: [0, -7], end: [0, -22] }); // Center line bottom
        } else if (type === 'rugby') {
            // Rugby Pitch
            addRect(50, 80); // Field
            // Try lines
            segments.push({ start: [-25, -35], end: [25, -35] });
            segments.push({ start: [-25, 35], end: [25, 35] });
            // Center line
            segments.push({ start: [-25, 0], end: [25, 0] });
            // Dashes for 10m lines? Simplified.
        }

        return segments;
    }, [type]);

    return (
        <group position={[0, -1.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            {lines.map((line, i) => {
                // Create a thin plane for each line
                const dx = line.end[0] - line.start[0];
                const dy = line.end[1] - line.start[1];
                const len = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                const cx = (line.start[0] + line.end[0]) / 2;
                const cy = (line.start[1] + line.end[1]) / 2;

                return (
                    <mesh key={i} position={[cx, cy, 0]} rotation={[0, 0, angle]}>
                        <planeGeometry args={[len, 0.5]} />
                        <meshBasicMaterial color={color} />
                    </mesh>
                )
            })}
        </group>
    )
}

// Simple Stadium Crowd
const StadiumCrowd = ({ color }: { color: string }) => {
    const crowdRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (!crowdRef.current) return;
        // Bobbing up and down
        crowdRef.current.position.y = Math.sin(state.clock.elapsedTime * 5) * 0.1;
    });

    const particles = useMemo(() => {
        const p = [];
        for (let i = 0; i < 200; i++) {
            // Place in stands (Rectangular around court)
            // Determine side: 0=left, 1=right, 2=top, 3=bottom
            const side = Math.floor(Math.random() * 4);
            let x = 0, z = 0, y = 0;
            const dist = 30 + Math.random() * 10; // Distance from center
            const spread = 60; // Spread along side

            if (side === 0) { x = -dist; z = (Math.random() - 0.5) * spread; }
            else if (side === 1) { x = dist; z = (Math.random() - 0.5) * spread; }
            else if (side === 2) { z = -dist; x = (Math.random() - 0.5) * spread; }
            else { z = dist; x = (Math.random() - 0.5) * spread; }

            // Height based on distance (bleacher steps)
            y = (Math.abs(x) > Math.abs(z) ? Math.abs(x) : Math.abs(z)) * 0.3 - 5;
            if (y < 0) y = 0;

            p.push(<mesh key={i} position={[x, y, z]}>
                <sphereGeometry args={[0.4, 8, 8]} />
                <meshStandardMaterial color={Math.random() > 0.5 ? color : '#ffffff'} />
            </mesh>);
        }
        return p;
    }, [color]);

    return (
        <group ref={crowdRef}>
            {particles}
        </group>
    );
}

// Floodlights
const Floodlights = () => {
    return (
        <group>
            {[[-40, -40], [40, -40], [-40, 40], [40, 40]].map((pos, i) => (
                <group key={i} position={[pos[0], 25, pos[1]]} lookAt={new THREE.Vector3(0, 0, 0)}>
                    <mesh rotation={[Math.PI / 4, 0, 0]}>
                        <boxGeometry args={[4, 2, 1]} />
                        <meshStandardMaterial color="#444" emissive="#aaa" />
                    </mesh>
                    {/* The light source */}
                    <spotLight
                        color="#ffffff"
                        intensity={2}
                        distance={100}
                        angle={0.6}
                        penumbra={0.5}
                        castShadow
                    />
                    {/* Pole */}
                    <mesh position={[0, -12.5, 0]}>
                        <cylinderGeometry args={[0.5, 0.8, 25]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                </group>
            ))}
        </group>
    )
}

export const SportsBackground = () => {
    const { theme } = useGameStore();
    const type = theme.id; // 'tennis', 'padel', 'pickleball', 'rugby'

    const config = useMemo(() => {
        switch (type) {
            case 'rugby':
                return { floor: '#2E8B57', lines: '#ffffff', net: false, goal: true, label: 'RUGBY UNION', crowdColor: '#006400' };
            case 'pickleball':
                return { floor: '#1E90FF', lines: '#ffffff', net: true, goal: false, label: 'PICKLEBALL', crowdColor: '#1E90FF' };
            case 'padel':
                return { floor: '#4169E1', lines: '#ffffff', net: true, goal: false, label: 'PADEL', crowdColor: '#4169E1' };
            case 'tennis':
            default:
                return { floor: '#2E8B57', lines: '#ffffff', net: true, goal: false, label: 'TENNIS', crowdColor: '#2E8B57' };
        }
    }, [type]);

    return (
        <group>
            {/* Daylight / Floodlights Override */}
            <ambientLight intensity={0.4} />

            <Floodlights />

            <fog attach="fog" args={['#1a1a1a', 20, 120]} />

            {/* Stadium Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[150, 150]} />
                <meshStandardMaterial color={config.floor} roughness={0.8} />
            </mesh>

            <CourtLines type={type} color={config.lines} />

            <StadiumCrowd color={config.crowdColor} />

            {/* Net (Tennis/Padel/Pickleball) */}
            {config.net && (
                <group position={[0, -1, 0]}>
                    <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
                        <boxGeometry args={[32, 2, 0.1]} />
                        <meshStandardMaterial color="white" opacity={0.6} transparent />
                        {/* Net Tape */}
                        <mesh position={[0, 1, 0]}>
                            <boxGeometry args={[32, 0.2, 0.12]} />
                            <meshStandardMaterial color="white" />
                        </mesh>
                    </mesh>
                    {/* Posts */}
                    <mesh position={[16, 0, 0]}>
                        <cylinderGeometry args={[0.2, 0.2, 2]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    <mesh position={[-16, 0, 0]}>
                        <cylinderGeometry args={[0.2, 0.2, 2]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                </group>
            )}

            {/* Rugby Goal Posts */}
            {config.goal && (
                <group position={[0, 0, -35]}>
                    <mesh position={[-5, 5, 0]}>
                        <cylinderGeometry args={[0.2, 0.2, 10]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                    <mesh position={[5, 5, 0]}>
                        <cylinderGeometry args={[0.2, 0.2, 10]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                    <mesh position={[0, 3, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.2, 0.2, 10]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                    {/* Second Goal Post on other side? Usually far away, maybe just one for visual context */}
                    <group position={[0, 0, 70]} rotation={[0, Math.PI, 0]}>
                        <mesh position={[-5, 5, 0]}>
                            <cylinderGeometry args={[0.2, 0.2, 10]} />
                            <meshStandardMaterial color="white" />
                        </mesh>
                        <mesh position={[5, 5, 0]}>
                            <cylinderGeometry args={[0.2, 0.2, 10]} />
                            <meshStandardMaterial color="white" />
                        </mesh>
                        <mesh position={[0, 3, 0]} rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.2, 0.2, 10]} />
                            <meshStandardMaterial color="white" />
                        </mesh>
                    </group>
                </group>
            )}
        </group>
    );
};
