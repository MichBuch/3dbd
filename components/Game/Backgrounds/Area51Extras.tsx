import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export const FullMoon = () => (
    <group position={[100, 40, -200]}>
        {/* Moon Body - Neon Yellow */}
        <mesh>
            <sphereGeometry args={[40, 64, 64]} />
            <meshStandardMaterial color="#EAFF00" emissive="#EAFF00" emissiveIntensity={0.2} roughness={0.8} />
        </mesh>
        <pointLight intensity={1.5} distance={600} decay={2} color="#EAFF00" />
    </group>
);

export const ShootingStar = () => {
    const ref = useRef<THREE.Group>(null);
    const [active, setActive] = useState(false);

    useFrame((state, delta) => {
        if (!ref.current) return;

        if (active) {
            ref.current.position.x += delta * 400; // Super fast
            ref.current.position.y -= delta * 150;

            if (ref.current.position.x > 300) {
                setActive(false);
            }
        } else {
            if (Math.random() > 0.995) { // Occasional spawn
                setActive(true);
                ref.current.position.set(-300, 150, -250);
            }
        }
    });

    return (
        <group ref={ref} visible={active}>
            <mesh>
                <sphereGeometry args={[1.5]} />
                <meshBasicMaterial color="white" />
            </mesh>
            {/* Tail */}
            <mesh position={[-8, 3, 0]} rotation={[0, 0, -0.4]}>
                <boxGeometry args={[16, 0.4, 0.4]} />
                <meshBasicMaterial color="white" transparent opacity={0.4} />
            </mesh>
        </group>
    )
}

export const Satellite = () => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.1;
            ref.current.rotation.z += delta * 0.05;
            // Orbit
            const t = state.clock.elapsedTime * 0.05;
            ref.current.position.x = Math.sin(t) * 300;
            ref.current.position.z = Math.cos(t) * 300 - 200;
        }
    });
    return (
        <group ref={ref} position={[0, 200, -300]}>
            <mesh>
                <boxGeometry args={[4, 4, 4]} />
                <meshStandardMaterial color="gold" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[6, 0, 0]}>
                <boxGeometry args={[8, 0.2, 3]} />
                <meshStandardMaterial color="blue" metalness={0.8} />
            </mesh>
            <mesh position={[-6, 0, 0]}>
                <boxGeometry args={[8, 0.2, 3]} />
                <meshStandardMaterial color="blue" metalness={0.8} />
            </mesh>
        </group>
    )
}

export const ScoutUFO = () => {
    // A smaller, faster UFO that darts around
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime * 1.5;
        // Figure 8 / Infinity path
        ref.current.position.x = Math.sin(t) * 200;
        ref.current.position.y = 80 + Math.cos(t * 2) * 40;
        ref.current.position.z = -300 + Math.sin(t * 0.5) * 100;

        ref.current.rotation.z = Math.sin(t) * 0.5; // Bank
        ref.current.rotation.y += 0.05; // Spin
    });

    return (
        <group ref={ref}>
            <mesh>
                <cylinderGeometry args={[8, 3, 1.5, 16]} />
                <meshStandardMaterial color="#666" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.8, 0]}>
                <sphereGeometry args={[2.5]} />
                <meshBasicMaterial color="#ff00ff" />
            </mesh>
            {/* Lights */}
            {[0, 1, 2, 3].map(i => (
                <mesh key={i} position={[5, 0, 0]} rotation={[0, i * Math.PI / 2, 0]}>
                    <sphereGeometry args={[0.5]} />
                    <meshBasicMaterial color="cyan" />
                </mesh>
            ))}
        </group>
    )
}

export const SpaceXRocket = () => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (ref.current) {
            // Blasting Off Animation
            const t = state.clock.elapsedTime;
            // Rise up from 0 to 400, then loop back to 0 effectively
            const yPos = (t * 50) % 600;

            ref.current.position.y = yPos - 50; // Start below horizon

            // Wobble during ascent
            ref.current.rotation.z = Math.sin(t * 10) * 0.02;
        }
    });

    return (
        <group ref={ref} position={[300, 0, -500]}>
            {/* Body */}
            <mesh>
                <cylinderGeometry args={[2, 2, 40, 16]} />
                <meshStandardMaterial color="white" metalness={0.6} />
            </mesh>
            {/* Cone */}
            <mesh position={[0, 21, 0]}>
                <cylinderGeometry args={[0, 2, 6, 16]} />
                <meshStandardMaterial color="white" metalness={0.6} />
            </mesh>
            {/* Legs/Fins */}
            {[0, 1, 2, 3].map(i => (
                <mesh key={i} position={[0, -16, 0]} rotation={[0, i * Math.PI / 2, 0.5]}>
                    <boxGeometry args={[1, 10, 0.5]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
            ))}
            {/* MASSIVE Flame */}
            <mesh position={[0, -30, 0]}>
                <coneGeometry args={[3, 20, 16]} />
                <meshBasicMaterial color="orange" transparent opacity={0.8} />
            </mesh>
            <pointLight position={[0, -25, 0]} color="orange" intensity={10} distance={100} />
            {/* Smoke Stream */}
            <mesh position={[0, -50, 0]}>
                <coneGeometry args={[6, 40, 16]} />
                <meshBasicMaterial color="#555" transparent opacity={0.4} />
            </mesh>
        </group>
    )
}

export const Agent3D = ({ position }: { position: [number, number, number] }) => {
    return (
        <group position={position}>
            <mesh position={[0, 2, 0]}>
                <boxGeometry args={[1, 2.5, 0.6]} />
                <meshStandardMaterial color="#000" />
            </mesh>
            <mesh position={[-0.3, 0.5, 0]}>
                <boxGeometry args={[0.3, 1.5, 0.4]} />
                <meshStandardMaterial color="#000" />
            </mesh>
            <mesh position={[0.3, 0.5, 0]}>
                <boxGeometry args={[0.3, 1.5, 0.4]} />
                <meshStandardMaterial color="#000" />
            </mesh>
            <mesh position={[0, 3.6, 0]}>
                <boxGeometry args={[0.6, 0.7, 0.6]} />
                <meshStandardMaterial color="#ffccaa" />
            </mesh>
            {/* Sunglasses */}
            <mesh position={[0, 3.7, 0.32]}>
                <boxGeometry args={[0.5, 0.15, 0.1]} />
                <meshStandardMaterial color="#000" metalness={0.8} />
            </mesh>
            {/* Black Hat (Fedora) */}
            <group position={[0, 4.0, 0]}>
                {/* Brim */}
                <mesh>
                    <cylinderGeometry args={[0.7, 0.7, 0.05, 16]} />
                    <meshStandardMaterial color="#000" />
                </mesh>
                {/* Top */}
                <mesh position={[0, 0.15, 0]}>
                    <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
                    <meshStandardMaterial color="#000" />
                </mesh>
            </group>
        </group>
    );
};

export const Cactus = ({ position }: { position: [number, number, number] }) => {
    return (
        <group position={position}>
            {/* Main Trunk */}
            <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 3, 8]} />
                <meshStandardMaterial color="#2d4c1e" roughness={0.9} />
            </mesh>
            <mesh position={[0, 3, 0]}>
                <sphereGeometry args={[0.4]} />
                <meshStandardMaterial color="#2d4c1e" roughness={0.9} />
            </mesh>
            {/* Right Arm */}
            <group position={[0.4, 1.5, 0]}>
                <mesh position={[0.4, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
                    <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
                    <meshStandardMaterial color="#2d4c1e" roughness={0.9} />
                </mesh>
                <mesh position={[0.7, 0.5, 0]}>
                    <cylinderGeometry args={[0.3, 0.3, 1.5, 8]} />
                    <meshStandardMaterial color="#2d4c1e" roughness={0.9} />
                </mesh>
                <mesh position={[0.7, 1.25, 0]}>
                    <sphereGeometry args={[0.3]} />
                    <meshStandardMaterial color="#2d4c1e" roughness={0.9} />
                </mesh>
            </group>
            {/* Left Arm */}
            <group position={[-0.4, 1, 0]} rotation={[0, Math.PI, 0]}>
                <mesh position={[0.4, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
                    <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
                    <meshStandardMaterial color="#2d4c1e" roughness={0.9} />
                </mesh>
                <mesh position={[0.7, 0.5, 0]}>
                    <cylinderGeometry args={[0.3, 0.3, 1.5, 8]} />
                    <meshStandardMaterial color="#2d4c1e" roughness={0.9} />
                </mesh>
                <mesh position={[0.7, 1.25, 0]}>
                    <sphereGeometry args={[0.3]} />
                    <meshStandardMaterial color="#2d4c1e" roughness={0.9} />
                </mesh>
            </group>
        </group>
    )
}

export const Rock = ({ scale = 1 }: { scale?: number }) => {
    return (
        <mesh rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
            <dodecahedronGeometry args={[0.5 * scale, 0]} />
            <meshStandardMaterial color="#5a4d41" roughness={1} flatShading />
        </mesh>
    );
};

export const Snake = () => {
    // A simple coiled snake
    return (
        <group>
            {/* Coil 1 (Bottom) */}
            <mesh position={[0, 0.2, 0]}>
                <torusGeometry args={[0.6, 0.15, 8, 16, Math.PI * 1.8]} />
                <meshStandardMaterial color="#4a6b3e" roughness={0.6} />
            </mesh>
            {/* Coil 2 (Mid) */}
            <mesh position={[0.1, 0.4, 0.1]} rotation={[0, 1, 0]}>
                <torusGeometry args={[0.45, 0.14, 8, 16, Math.PI * 1.8]} />
                <meshStandardMaterial color="#4a6b3e" roughness={0.6} />
            </mesh>
            {/* Head */}
            <group position={[0.3, 0.8, 0.3]} rotation={[0, 0.5, 0.5]}>
                <mesh>
                    <capsuleGeometry args={[0.16, 0.4, 4, 8]} />
                    <meshStandardMaterial color="#4a6b3e" roughness={0.6} />
                </mesh>
                {/* Eyes */}
                <mesh position={[0.1, 0.1, 0.1]}>
                    <sphereGeometry args={[0.04]} />
                    <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={0.5} />
                </mesh>
                <mesh position={[-0.1, 0.1, 0.1]}>
                    <sphereGeometry args={[0.04]} />
                    <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={0.5} />
                </mesh>
                {/* Tongue */}
                <mesh position={[0, -0.1, 0.2]} rotation={[0.5, 0, 0]}>
                    <boxGeometry args={[0.02, 0.01, 0.2]} />
                    <meshStandardMaterial color="red" />
                </mesh>
            </group>
        </group>
    )
}

export const Hoverboard = () => {
    return (
        <group>
            {/* Board Deck */}
            <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[1.5, 0.1, 3]} />
                <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Glowing Rims */}
            <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[1.55, 0.05, 3.05]} />
                <meshStandardMaterial color="#39FF14" emissive="#39FF14" emissiveIntensity={2} />
            </mesh>
            {/* Thruster Glow (Bottom) */}
            <pointLight position={[0, 0, 0]} color="#39FF14" distance={3} intensity={2} />
        </group>
    )
}

export const DryBush = () => {
    return (
        <group>
            {/* Much Larger */}
            {[...Array(8)].map((_, i) => (
                <mesh key={i} position={[0, 0, 0]} rotation={[Math.random(), Math.random() * Math.PI, Math.random()]}>
                    <cylinderGeometry args={[0.05, 0.1, 2 + Math.random()]} />
                    <meshStandardMaterial color="#5d4037" />
                </mesh>
            ))}
        </group>
    )
}

export const Hill = ({ scale = 1 }: { scale?: number }) => {
    return (
        <group scale={[scale, scale * 0.8, scale]}>
            {/* Jagged Rocky Hill */}
            <mesh rotation={[Math.random(), 0, Math.random()]}>
                <dodecahedronGeometry args={[15, 0]} />
                <meshStandardMaterial color="#4b3d32" roughness={1} flatShading />
            </mesh>
            {/* Sub-rock */}
            <mesh position={[10, -5, 5]}>
                <dodecahedronGeometry args={[10, 0]} />
                <meshStandardMaterial color="#3d2e20" roughness={1} flatShading />
            </mesh>
        </group>
    )
}

export const Galaxy = ({ position, rotation, scale = 1 }: { position: [number, number, number], rotation: [number, number, number], scale?: number }) => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.2; // Spin!
        }
    });

    const points = useMemo(() => {
        const p = [];
        const count = 3000;
        for (let i = 0; i < count; i++) {
            const angle = i * 0.1;
            const dist = i * 0.05;
            const armOffset = (i % 3) * (Math.PI * 2 / 3);
            const x = Math.cos(angle + armOffset) * dist;
            const y = (Math.random() - 0.5) * (dist * 0.4);
            const z = Math.sin(angle + armOffset) * dist;
            p.push(x, y, z);
        }
        return new Float32Array(p);
    }, []);

    return (
        <group ref={ref} position={position} rotation={rotation} scale={scale}>
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[points, 3]} />
                </bufferGeometry>
                <pointsMaterial size={1.5} color="#ccffff" sizeAttenuation transparent opacity={0.6} blending={THREE.AdditiveBlending} />
            </points>
            <mesh>
                <sphereGeometry args={[8, 16, 16]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
            </mesh>
        </group>
    );
};

export const SpaceDebris = () => {
    const debris = useMemo(() => {
        return [...Array(30)].map(() => ({
            pos: [
                (Math.random() - 0.5) * 800,
                100 + Math.random() * 400,
                -200 - Math.random() * 600
            ] as [number, number, number],
            rot: [Math.random(), Math.random(), Math.random()] as [number, number, number],
            scale: 1 + Math.random() * 3
        }));
    }, []);

    return (
        <group>
            {debris.map((d, i) => (
                <mesh key={i} position={d.pos} rotation={d.rot} scale={d.scale}>
                    <dodecahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
                </mesh>
            ))}
        </group>
    )
}

export const BannerSatellite = () => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime * 0.3;
        // Wide circle path high up
        ref.current.position.x = Math.sin(t) * 450;
        ref.current.position.z = Math.cos(t) * 200 - 450;
        ref.current.position.y = 250 + Math.sin(t * 2) * 20;

        // Face forward along path
        ref.current.rotation.y = Math.atan2(Math.cos(t) * 450, -Math.sin(t) * 200);
    });

    return (
        <group ref={ref} scale={2}>
            {/* Satellite Body */}
            <mesh>
                <boxGeometry args={[4, 4, 4]} />
                <meshStandardMaterial color="gold" metalness={1} roughness={0.2} />
            </mesh>
            {/* Solar Panels */}
            <mesh position={[6, 0, 0]}>
                <boxGeometry args={[10, 0.2, 4]} />
                <meshStandardMaterial color="blue" metalness={0.8} />
            </mesh>
            <mesh position={[-6, 0, 0]}>
                <boxGeometry args={[10, 0.2, 4]} />
                <meshStandardMaterial color="blue" metalness={0.8} />
            </mesh>

            {/* Banner trailing behind */}
            <group position={[0, 0, 15]} rotation={[0, Math.PI, 0]}>
                <mesh position={[0, 0, 40]}>
                    <planeGeometry args={[120, 20]} />
                    <meshBasicMaterial color="#000" side={THREE.DoubleSide} />
                </mesh>
                <Text
                    position={[0, 0, 40.1]}
                    fontSize={12}
                    color="#00FF00"
                    anchorX="center"
                    anchorY="middle"
                    rotation={[0, Math.PI, 0]}
                >
                    COMING SOON
                </Text>
                {/* Tow Rope */}
                <mesh position={[0, 0, 20]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.1, 0.1, 40]} />
                    <meshBasicMaterial color="#888" />
                </mesh>
            </group>
        </group>
    )
}
