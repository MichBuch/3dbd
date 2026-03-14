'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Procedural Fire Particles
const FireParticles = () => {
    const count = 50;
    const mesh = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 1.5;
            const y = Math.random() * 2;
            const z = (Math.random() - 0.5) * 1;
            const speed = 0.5 + Math.random();
            temp.push({ x, y, z, speed, offset: Math.random() * 100 });
        }
        return temp;
    }, []);

    const positions = useMemo(() => new Float32Array(count * 3), []);

    useFrame((state) => {
        if (!mesh.current) return;
        const t = state.clock.elapsedTime;

        for (let i = 0; i < count; i++) {
            const p = particles[i];

            // Rise up
            p.y = (Math.sin((t * p.speed) + p.offset) + 1) * 1.5;
            // Wiggle
            p.x = Math.sin(t * 3 + p.offset) * 0.2;

            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;
        }
        mesh.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.3} color="#FF4500" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </points>
    );
};

// Fireplace Component
const Fireplace = ({ position, rotation }: any) => {
    const light = useRef<THREE.PointLight>(null);
    useFrame((state) => {
        if (light.current) {
            // Flicker effect
            light.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 10) * 0.5 + Math.random() * 0.5;
        }
    });

    return (
        <group position={position} rotation={rotation}>
            {/* Mantle/Structure */}
            <mesh position={[0, 2.5, 0]}>
                <boxGeometry args={[6, 5, 2]} />
                <meshStandardMaterial color="#8B4513" roughness={0.9} /> {/* Brick/Stone color */}
            </mesh>
            {/* Hearth (Black inside) */}
            <mesh position={[0, 1.5, 0.1]}>
                <boxGeometry args={[3, 2.5, 1.8]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>

            {/* Fire */}
            <group position={[0, 0.5, 0.5]}>
                <FireParticles />
                <pointLight ref={light} color="#FF6600" distance={20} decay={2} />
            </group>

            {/* Chimney extending up */}
            <mesh position={[0, 7, -0.5]}>
                <boxGeometry args={[4, 10, 2]} />
                <meshStandardMaterial color="#8B4513" roughness={0.9} />
            </mesh>
        </group>
    );
};

// Fish Tank Component
const FishTank = ({ position, rotation }: any) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Glass Box */}
            <mesh position={[0, 3, 0]}>
                <boxGeometry args={[8, 4, 3]} />
                <meshPhysicalMaterial
                    color="#E0FFFF"
                    transmission={0.9}
                    roughness={0.05}
                    thickness={0.5}
                    transparent
                    opacity={0.3}
                />
            </mesh>
            {/* Water Inside */}
            <mesh position={[0, 2.8, 0]}>
                <boxGeometry args={[7.8, 3.5, 2.8]} />
                <meshBasicMaterial color="#00FFFF" transparent opacity={0.2} />
            </mesh>
            {/* Stand */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[8.2, 1, 3.2]} />
                <meshStandardMaterial color="#333" />
            </mesh>

            {/* Bubbles */}
            <group position={[0, 2, 0]}>
                <Sparkles count={20} scale={[7, 3, 2]} size={2} speed={1} opacity={0.5} color="white" noise={0.5} />
            </group>

            {/* Fish */}
            <Fish position={[0, 3, 0]} color="#FFD700" speed={1} />
            <Fish position={[2, 2.5, 0.5]} color="#FF4500" speed={1.5} />
            <Fish position={[-2, 3.5, -0.5]} color="#00FF00" speed={0.8} />

            {/* Tank Light */}
            <pointLight position={[0, 4.5, 0]} color="#E0FFFF" intensity={0.5} distance={10} />
        </group>
    )
}

const Fish = ({ position, color, speed }: any) => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.elapsedTime * speed;
            // Swim in figure 8 or circle
            ref.current.position.x = Math.sin(t) * 3;
            ref.current.position.z = Math.cos(t * 0.5) * 1;
            // Face direction
            ref.current.rotation.y = Math.cos(t) + Math.PI / 2;

            // Wiggle tail (simplified as whole body wobble)
            ref.current.rotation.z = Math.sin(t * 10) * 0.1;
        }
    });

    return (
        <group ref={ref} position={position}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.2, 0.6, 4, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Tail */}
            <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <coneGeometry args={[0.2, 0.4, 4]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
    )
}

export const CozyBackground = () => {
    return (
        <group>
            {/* Warm Indoor Lighting */}
            <ambientLight intensity={0.3} color="#FFD700" />

            {/* Floor (Wood) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#5D4037" roughness={0.8} />
            </mesh>

            {/* Rug */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]}>
                <circleGeometry args={[15, 64]} />
                <meshStandardMaterial color="#8B0000" roughness={1} />
            </mesh>

            {/* Walls (Log Cabin) */}
            {/* Back Wall */}
            <group position={[0, 10, -40]}>
                {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map((y) => (
                    <mesh key={y} position={[0, y - 10, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[1, 1, 80]} />
                        <meshStandardMaterial color="#8B4513" />
                    </mesh>
                ))}
            </group>
            {/* Side Walls */}
            <group position={[-40, 10, 0]} rotation={[0, Math.PI / 2, 0]}>
                {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map((y) => (
                    <mesh key={y} position={[0, y - 10, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[1, 1, 80]} />
                        <meshStandardMaterial color="#8B4513" />
                    </mesh>
                ))}
            </group>
            <group position={[40, 10, 0]} rotation={[0, Math.PI / 2, 0]}>
                {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map((y) => (
                    <mesh key={y} position={[0, y - 10, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[1, 1, 80]} />
                        <meshStandardMaterial color="#8B4513" />
                    </mesh>
                ))}
            </group>


            {/* Fireplace */}
            <Fireplace position={[0, -2, -35]} />

            {/* Fish Tank */}
            <FishTank position={[25, -2, -25]} rotation={[0, -0.5, 0]} />

            {/* Cat on rug */}
            <CozyCat position={[-5, -1.85, 5]} />

            {/* Bookshelf on back wall */}
            <Bookshelf position={[20, 0, -37.5]} rotation={[0, 0, 0]} />

            {/* Window (Cold Outside) with falling snow */}
            <group position={[-20, 10, -38]}>
                <mesh>
                    <boxGeometry args={[10, 8, 1]} />
                    <meshStandardMaterial color="#87CEEB" emissive="#1E90FF" emissiveIntensity={0.5} />
                </mesh>
                {/* Window Frame */}
                <mesh>
                    <boxGeometry args={[10.5, 0.5, 1.2]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                    <boxGeometry args={[8.5, 0.5, 1.2]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
                {/* Snow falling outside window */}
                <WindowSnow />
            </group>

        </group>
    );
};

// Cat with swishing tail
const CozyCat = ({ position }: any) => {
    const tailRef = useRef<THREE.Mesh>(null);
    const blinkRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (tailRef.current) {
            // Tail sways left-right
            tailRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.5;
        }
        if (blinkRef.current) {
            // Blink every ~4 seconds
            const t = state.clock.elapsedTime;
            const blinkCycle = t % 4;
            blinkRef.current.scale.y = (blinkCycle > 3.9 && blinkCycle < 4) ? 0.1 : 1;
        }
    });
    return (
        <group position={position}>
            {/* Body - curled up */}
            <mesh position={[0, 0.3, 0]} scale={[1.2, 0.8, 1]}>
                <sphereGeometry args={[0.55, 10, 10]} />
                <meshStandardMaterial color="#888" roughness={0.9} />
            </mesh>
            {/* Head */}
            <mesh position={[0.5, 0.7, 0]}>
                <sphereGeometry args={[0.35, 10, 10]} />
                <meshStandardMaterial color="#888" roughness={0.9} />
            </mesh>
            {/* Ears */}
            <mesh position={[0.6, 1.0, 0.15]} rotation={[0, 0, 0.3]}>
                <coneGeometry args={[0.1, 0.25, 4]} />
                <meshStandardMaterial color="#777" roughness={0.9} />
            </mesh>
            <mesh position={[0.6, 1.0, -0.15]} rotation={[0, 0, -0.3]}>
                <coneGeometry args={[0.1, 0.25, 4]} />
                <meshStandardMaterial color="#777" roughness={0.9} />
            </mesh>
            {/* Eyes */}
            <mesh ref={blinkRef} position={[0.82, 0.75, 0.15]}>
                <sphereGeometry args={[0.06, 6, 6]} />
                <meshBasicMaterial color="#44ff44" />
            </mesh>
            <mesh position={[0.82, 0.75, -0.15]}>
                <sphereGeometry args={[0.06, 6, 6]} />
                <meshBasicMaterial color="#44ff44" />
            </mesh>
            {/* Nose */}
            <mesh position={[0.87, 0.68, 0]}>
                <sphereGeometry args={[0.03, 5, 5]} />
                <meshBasicMaterial color="#ffaaaa" />
            </mesh>
            {/* Tail - swings */}
            <mesh ref={tailRef} position={[-0.4, 0.2, 0]} rotation={[0, 0, -1.2]}>
                <capsuleGeometry args={[0.07, 0.9, 4, 8]} />
                <meshStandardMaterial color="#888" roughness={0.9} />
            </mesh>
            {/* White chest */}
            <mesh position={[0.2, 0.3, 0]} scale={[0.5, 0.6, 0.9]}>
                <sphereGeometry args={[0.4, 8, 8]} />
                <meshStandardMaterial color="#dddddd" roughness={0.9} />
            </mesh>
        </group>
    );
};

// Bookshelf on the wall
const Bookshelf = ({ position, rotation }: any) => {
    const bookColors = ['#CC2200', '#224488', '#116622', '#AA6600', '#882288', '#116688', '#AA2244', '#446600'];
    return (
        <group position={position} rotation={rotation}>
            {/* Shelf frame */}
            <mesh position={[0, 5, 0]}>
                <boxGeometry args={[12, 10, 2]} />
                <meshStandardMaterial color="#5C3A1E" roughness={0.9} />
            </mesh>
            {/* Back panel */}
            <mesh position={[0, 5, 0.6]}>
                <boxGeometry args={[11.5, 9.5, 0.2]} />
                <meshStandardMaterial color="#7A4A2A" roughness={0.9} />
            </mesh>
            {/* 3 shelves */}
            {[1.5, 4.5, 7.5].map((y, si) => (
                <group key={si}>
                    <mesh position={[0, y, 0]}>
                        <boxGeometry args={[11.6, 0.3, 2]} />
                        <meshStandardMaterial color="#5C3A1E" roughness={0.9} />
                    </mesh>
                    {/* Books on each shelf */}
                    {bookColors.slice(0, 6).map((color, bi) => (
                        <mesh key={bi} position={[-4.5 + bi * 1.5 + (si % 2) * 0.4, y + 1.1, 0.2]}>
                            <boxGeometry args={[0.8 + (bi % 2) * 0.2, 2, 1.2]} />
                            <meshStandardMaterial color={color} roughness={0.8} />
                        </mesh>
                    ))}
                </group>
            ))}
        </group>
    );
};

// Snow falling outside the window
const WindowSnow = () => {
    const count = 30;
    const ref = useRef<THREE.Points>(null);
    const particles = useMemo(() => {
        return Array.from({ length: count }, () => ({
            x: (Math.random() - 0.5) * 8,
            y: 4 + Math.random() * 8,
            z: 0.8,
            speed: 0.3 + Math.random() * 0.5,
            drift: (Math.random() - 0.5) * 0.5
        }));
    }, []);
    const positions = useMemo(() => new Float32Array(count * 3), []);

    useFrame((state, delta) => {
        if (!ref.current) return;
        particles.forEach((p, i) => {
            p.y -= p.speed * delta * 2;
            p.x += p.drift * delta;
            if (p.y < -4) { p.y = 4; p.x = (Math.random() - 0.5) * 8; }
            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;
        });
        ref.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.25} color="#ffffff" transparent opacity={0.85} sizeAttenuation />
        </points>
    );
};
