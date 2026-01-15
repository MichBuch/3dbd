import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
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

// ... existing imports ...

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

export const SpaceXRocket = () => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (ref.current) {
            // Slow vertical landing/takeoff hover
            const t = state.clock.elapsedTime;
            ref.current.position.y = 100 + Math.sin(t * 0.5) * 20;
        }
    });

    return (
        <group ref={ref} position={[200, 100, -400]}>
            {/* Body */}
            <mesh>
                <cylinderGeometry args={[2, 2, 30, 16]} />
                <meshStandardMaterial color="white" metalness={0.6} />
            </mesh>
            {/* Cone */}
            <mesh position={[0, 16, 0]}>
                <cylinderGeometry args={[0, 2, 5, 16]} />
                <meshStandardMaterial color="white" metalness={0.6} />
            </mesh>
            {/* Legs/Fins */}
            {[0, 1, 2, 3].map(i => (
                <mesh key={i} position={[0, -12, 0]} rotation={[0, i * Math.PI / 2, 0.5]}>
                    <boxGeometry args={[1, 8, 0.5]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
            ))}
            {/* Flame */}
            <mesh position={[0, -18, 0]}>
                <coneGeometry args={[1.5, 8, 16]} />
                <meshBasicMaterial color="orange" transparent opacity={0.8} />
            </mesh>
            <pointLight position={[0, -20, 0]} color="orange" intensity={5} distance={50} />
        </group>
    )
}

export const PassingAircraft = () => {

    const ref = useRef<THREE.Group>(null);
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.position.x += delta * 15; // Slower, high altitude
            if (ref.current.position.x > 400) ref.current.position.x = -400;
        }
    });

    // Blinking lights
    const [on, setOn] = useState(true);
    useFrame(({ clock }) => {
        if (Math.floor(clock.elapsedTime * 4) % 2 === 0) setOn(true);
        else setOn(false);
    });

    return (
        <group ref={ref} position={[-400, 180, -150]}>
            {/* Tiny speck body */}
            <mesh>
                <sphereGeometry args={[0.5]} />
                <meshBasicMaterial color="#555" />
            </mesh>
            {/* Blinking Red/Green Navigation Lights */}
            {on && (
                <>
                    <mesh position={[1, 0, 0]}>
                        <sphereGeometry args={[0.8]} />
                        <meshBasicMaterial color="red" />
                    </mesh>
                    <mesh position={[-1, 0, 0]}>
                        <sphereGeometry args={[0.8]} />
                        <meshBasicMaterial color="green" />
                    </mesh>
                </>
            )}
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
            {[...Array(6)].map((_, i) => (
                <mesh key={i} position={[0, 0, 0]} rotation={[Math.random(), Math.random() * Math.PI, Math.random()]}>
                    <cylinderGeometry args={[0.02, 0.05, 0.6 + Math.random() * 0.4]} />
                    <meshStandardMaterial color="#3d2e20" />
                </mesh>
            ))}
        </group>
    )
}

export const Hill = ({ scale = 1 }: { scale?: number }) => {
    return (
        <mesh scale={[1, 0.4, 1]}> {/* Flattened Y to make it a hill */}
            <sphereGeometry args={[15 * scale, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#4b3d32" roughness={0.9} />
        </mesh>
    )
}

export const SpaceDebris = () => {
    // Scattered small junk in the sky
    const debris = useMemo(() => {
        return [...Array(20)].map(() => ({
            pos: [
                (Math.random() - 0.5) * 600,
                100 + Math.random() * 200,
                -200 - Math.random() * 400
            ] as [number, number, number],
            rot: [Math.random(), Math.random(), Math.random()] as [number, number, number],
            scale: 0.5 + Math.random() * 2
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

export const Galaxy = ({ position, rotation, scale = 1 }: { position: [number, number, number], rotation: [number, number, number], scale?: number }) => {
    const points = useMemo(() => {
        const p = [];
        const count = 2000;
        for (let i = 0; i < count; i++) {
            const angle = i * 0.1;
            const dist = i * 0.05; // Spiral out

            // Spiral arms
            const armOffset = (i % 3) * (Math.PI * 2 / 3);
            const x = Math.cos(angle + armOffset) * dist;
            const y = (Math.random() - 0.5) * (dist * 0.2); // Flattened disk
            const z = Math.sin(angle + armOffset) * dist;

            p.push(x, y, z);
        }
        return new Float32Array(p);
    }, []);

    return (
        <group position={position} rotation={rotation} scale={scale}>
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} />
                </bufferGeometry>
                <pointsMaterial size={2} color="#ffffff" sizeAttenuation transparent opacity={0.6} />
            </points>
            {/* Core Glow */}
            <mesh>
                <sphereGeometry args={[10, 16, 16]} />
                <meshBasicMaterial color="#ffccaa" transparent opacity={0.4} />
            </mesh>
        </group>
    );
};
