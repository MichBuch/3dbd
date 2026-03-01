'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

export const FestiveBackground = () => {
    const { theme } = useGameStore();
    const type = theme.id;

    const objects = useMemo(() => {
        const items: any[] = [];
        if (type === 'chinese_new_year') {
            for (let i = 0; i < 30; i++) {
                items.push({
                    id: i, type: 'lantern',
                    x: (Math.random() - 0.5) * 100,
                    y: -20 + Math.random() * 50,
                    z: (Math.random() - 0.5) * 60,
                    speed: 0.5 + Math.random() * 1,
                    scale: 2 + Math.random()
                });
            }
        } else if (type === 'diwali') {
            for (let i = 0; i < 40; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = 20 + Math.random() * 40;
                items.push({
                    id: i, type: 'diya',
                    x: Math.cos(angle) * r,
                    z: Math.sin(angle) * r,
                    scale: 1.5 + Math.random(),
                    offset: Math.random() * 100
                });
            }
        } else if (type === 'easter') {
            for (let i = 0; i < 12; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = 15 + Math.random() * 40;
                items.push({
                    id: `bun-${i}`, type: 'rabbit',
                    x: Math.cos(angle) * r,
                    z: Math.sin(angle) * r,
                    scale: 1.5,
                    speed: 0.8 + Math.random() * 0.6,
                    offset: Math.random() * 10
                });
            }
            for (let i = 0; i < 25; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = 20 + Math.random() * 50;
                items.push({
                    id: `egg-${i}`, type: 'egg',
                    x: Math.cos(angle) * r,
                    z: Math.sin(angle) * r,
                    color: ['#FFB7B2', '#B5EAD7', '#E2F0CB', '#FFDAC1', '#C7CEEA', '#FF9AA2'][Math.floor(Math.random() * 6)],
                    stripeColor: ['#FF9AA2', '#FFDAC1', '#B5EAD7', '#FFB7B2'][Math.floor(Math.random() * 4)]
                });
            }
        }
        return items;
    }, [type]);

    const bgColors: Record<string, string> = {
        chinese_new_year: '#8B0000',
        diwali: '#1a0a2e',
        easter: '#d4f5e9'
    };

    return (
        <group>
            <fog attach="fog" args={[bgColors[type] || 'black', 10, 90]} />
            <ambientLight intensity={type === 'easter' ? 1.2 : 0.6} color={type === 'easter' ? '#fffde7' : '#ffffff'} />

            {type === 'chinese_new_year' && (
                <>
                    <AnimatedFireworks />
                    <RedGround />
                    <pointLight position={[0, 20, -20]} color="#FF0000" intensity={3} distance={120} />
                    <pointLight position={[20, 10, 10]} color="#FFD700" intensity={2} distance={80} />
                </>
            )}

            {type === 'diwali' && (
                <>
                    <RangoliFloor />
                    <DiwaliGround />
                    <pointLight position={[0, 5, 0]} color="#FFD700" intensity={2} distance={60} />
                    <pointLight position={[15, 3, 15]} color="#FF6600" intensity={1.5} distance={40} />
                    <pointLight position={[-15, 3, -15]} color="#FF4500" intensity={1.5} distance={40} />
                </>
            )}

            {type === 'easter' && (
                <>
                    <EasterGround />
                    <directionalLight position={[10, 20, 10]} intensity={1.5} color="#fff9c4" castShadow />
                    <EasterFlowers />
                </>
            )}

            {objects.map((obj) => (
                <FestiveObject key={obj.id} data={obj} />
            ))}
        </group>
    );
};

// ── Chinese New Year ──────────────────────────────────────────────────────────

const RedGround = () => (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#3d0000" roughness={0.9} />
    </mesh>
);

// Animated bursting fireworks
const AnimatedFireworks = () => {
    const count = 8;
    const fireworks = useMemo(() => Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 80,
        y: 15 + Math.random() * 25,
        z: -20 + (Math.random() - 0.5) * 30,
        color: ['#FFD700', '#FF4500', '#FF69B4', '#00FFFF', '#FF0000', '#ADFF2F'][i % 6],
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.3
    })), []);

    return (
        <group>
            {fireworks.map(fw => <FireworkBurst key={fw.id} {...fw} />)}
        </group>
    );
};

const FireworkBurst = ({ x, y, z, color, phase, speed }: any) => {
    const ref = useRef<THREE.Points>(null);
    const particleCount = 60;

    const data = useRef<{ positions: Float32Array; directions: Float32Array } | null>(null);
    if (!data.current) {
        const positions = new Float32Array(particleCount * 3);
        const directions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            directions[i * 3] = Math.sin(phi) * Math.cos(theta);
            directions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta);
            directions[i * 3 + 2] = Math.cos(phi);
        }
        data.current = { positions, directions };
    }

    const { positions, directions } = data.current;

    useFrame((state) => {
        if (!ref.current) return;
        const t = (state.clock.elapsedTime * speed + phase) % (Math.PI * 2);
        const progress = Math.sin(t * 0.5) * (t < Math.PI ? 1 : Math.max(0, 1 - (t - Math.PI) / Math.PI));
        const radius = Math.max(0, progress) * 8;

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = directions[i * 3] * radius;
            positions[i * 3 + 1] = directions[i * 3 + 1] * radius;
            positions[i * 3 + 2] = directions[i * 3 + 2] * radius;
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
        (ref.current.material as THREE.PointsMaterial).opacity = Math.max(0, progress);
    });

    return (
        <points ref={ref} position={[x, y, z]}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.4} color={color} transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
        </points>
    );
};

// ── Diwali ────────────────────────────────────────────────────────────────────

const DiwaliGround = () => (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.05, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#1a0a2e" roughness={0.9} />
    </mesh>
);

const RangoliFloor = () => {
    const rings = [
        { r: 5, color: '#FF1493', segments: 32 },
        { r: 10, color: '#FFD700', segments: 48 },
        { r: 15, color: '#FF4500', segments: 64 },
        { r: 20, color: '#9400D3', segments: 80 },
    ];
    return (
        <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
            <mesh>
                <circleGeometry args={[22, 128]} />
                <meshStandardMaterial color="#2d0050" emissive="#4B0082" emissiveIntensity={0.3} roughness={0.8} />
            </mesh>
            {rings.map((ring, i) => (
                <mesh key={i} position={[0, 0, 0.01 * (i + 1)]}>
                    <ringGeometry args={[ring.r - 0.6, ring.r, ring.segments]} />
                    <meshStandardMaterial color={ring.color} emissive={ring.color} emissiveIntensity={0.8} roughness={0.5} />
                </mesh>
            ))}
            {/* Petal shapes */}
            {Array.from({ length: 8 }, (_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                    <mesh key={`petal-${i}`} position={[Math.cos(angle) * 12, Math.sin(angle) * 12, 0.05]} rotation={[0, 0, angle + Math.PI / 2]} scale={[1, 2.2, 1]}>
                        <circleGeometry args={[1.5, 12]} />
                        <meshStandardMaterial color="#FF69B4" emissive="#FF1493" emissiveIntensity={0.6} />
                    </mesh>
                );
            })}
        </group>
    );
};

// Animated diya flame
const AnimatedDiyaFlame = () => {
    const ref = useRef<THREE.Mesh>(null);
    const lightRef = useRef<THREE.PointLight>(null);
    useFrame((state) => {
        if (!ref.current || !lightRef.current) return;
        const t = state.clock.elapsedTime;
        const flicker = 0.85 + Math.sin(t * 17.3) * 0.08 + Math.sin(t * 7.1) * 0.07;
        ref.current.scale.set(flicker, flicker + Math.sin(t * 11) * 0.1, flicker);
        ref.current.rotation.y = Math.sin(t * 3) * 0.3;
        lightRef.current.intensity = 1.5 * flicker + Math.random() * 0.3;
    });
    return (
        <group position={[0, 0.55, 0]}>
            {/* Outer flame */}
            <mesh ref={ref}>
                <coneGeometry args={[0.12, 0.45, 8]} />
                <meshStandardMaterial color="#FF6600" emissive="#FF4500" emissiveIntensity={3} transparent opacity={0.95} />
            </mesh>
            {/* Inner bright core */}
            <mesh position={[0, -0.05, 0]} scale={[0.5, 0.6, 0.5]}>
                <coneGeometry args={[0.12, 0.45, 8]} />
                <meshStandardMaterial color="#FFFF00" emissive="#FFFFFF" emissiveIntensity={5} transparent opacity={0.9} />
            </mesh>
            <pointLight ref={lightRef} color="#FF8C00" intensity={1.5} distance={6} decay={2} />
        </group>
    );
};

const Diya3D = ({ scale = 1 }) => (
    <group scale={[scale, scale, scale]}>
        {/* Clay bowl body */}
        <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
            <meshStandardMaterial color="#A0522D" roughness={0.95} metalness={0.05} />
        </mesh>
        {/* Inner dark bowl */}
        <mesh position={[0, 0.05, 0]} scale={[0.85, 0.85, 0.85]}>
            <sphereGeometry args={[0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
            <meshStandardMaterial color="#3d1a00" roughness={1} />
        </mesh>
        {/* Gold rim */}
        <mesh position={[0, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.48, 0.04, 8, 24]} />
            <meshStandardMaterial color="#DAA520" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Wick */}
        <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.15, 6]} />
            <meshStandardMaterial color="#2a1a00" />
        </mesh>
        <AnimatedDiyaFlame />
    </group>
);

// ── Easter ────────────────────────────────────────────────────────────────────

const EasterGround = () => (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[300, 300, 1, 1]} />
        <meshStandardMaterial color="#7ec850" roughness={0.9} />
    </mesh>
);

const EasterFlowers = () => {
    const flowers = useMemo(() => Array.from({ length: 40 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const r = 10 + Math.random() * 50;
        return { id: i, x: Math.cos(angle) * r, z: Math.sin(angle) * r, color: ['#FF69B4', '#FFD700', '#FF4500', '#FFFFFF', '#9370DB'][i % 5] };
    }), []);

    return (
        <group>
            {flowers.map(f => (
                <group key={f.id} position={[f.x, -1.8, f.z]}>
                    <mesh position={[0, 0.3, 0]}>
                        <sphereGeometry args={[0.3, 8, 8]} />
                        <meshStandardMaterial color={f.color} roughness={0.8} />
                    </mesh>
                    <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.05, 0.05, 0.6, 4]} />
                        <meshStandardMaterial color="#228B22" />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

// Proper 3D rabbit
const Rabbit3D = ({ scale = 1 }: { scale: number }) => (
    <group scale={[scale, scale, scale]}>
        {/* Body */}
        <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.5, 12, 12]} />
            <meshStandardMaterial color="#f5f0e8" roughness={0.9} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1.3, 0.1]}>
            <sphereGeometry args={[0.35, 12, 12]} />
            <meshStandardMaterial color="#f5f0e8" roughness={0.9} />
        </mesh>
        {/* Ears */}
        <mesh position={[-0.12, 1.9, 0.05]} rotation={[0.1, 0, -0.1]}>
            <capsuleGeometry args={[0.07, 0.45, 4, 8]} />
            <meshStandardMaterial color="#f5f0e8" roughness={0.9} />
        </mesh>
        <mesh position={[0.12, 1.9, 0.05]} rotation={[0.1, 0, 0.1]}>
            <capsuleGeometry args={[0.07, 0.45, 4, 8]} />
            <meshStandardMaterial color="#f5f0e8" roughness={0.9} />
        </mesh>
        {/* Inner ears */}
        <mesh position={[-0.12, 1.9, 0.1]} rotation={[0.1, 0, -0.1]}>
            <capsuleGeometry args={[0.04, 0.35, 4, 8]} />
            <meshStandardMaterial color="#ffb6c1" roughness={0.9} />
        </mesh>
        <mesh position={[0.12, 1.9, 0.1]} rotation={[0.1, 0, 0.1]}>
            <capsuleGeometry args={[0.04, 0.35, 4, 8]} />
            <meshStandardMaterial color="#ffb6c1" roughness={0.9} />
        </mesh>
        {/* Nose */}
        <mesh position={[0, 1.25, 0.42]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#ffb6c1" roughness={0.8} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.13, 1.35, 0.38]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#222" roughness={0.5} />
        </mesh>
        <mesh position={[0.13, 1.35, 0.38]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#222" roughness={0.5} />
        </mesh>
        {/* Tail */}
        <mesh position={[0, 0.55, -0.48]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
        {/* Front legs */}
        <mesh position={[-0.2, 0.2, 0.3]} rotation={[0.5, 0, 0]}>
            <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
            <meshStandardMaterial color="#f5f0e8" roughness={0.9} />
        </mesh>
        <mesh position={[0.2, 0.2, 0.3]} rotation={[0.5, 0, 0]}>
            <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
            <meshStandardMaterial color="#f5f0e8" roughness={0.9} />
        </mesh>
    </group>
);

// Decorated Easter egg
const EasterEgg3D = ({ color, stripeColor }: { color: string, stripeColor: string }) => (
    <group>
        <mesh scale={[1, 1.4, 1]} castShadow>
            <sphereGeometry args={[0.7, 16, 16]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
        </mesh>
        {/* Stripe */}
        <mesh scale={[1.01, 0.3, 1.01]} position={[0, 0, 0]}>
            <sphereGeometry args={[0.7, 16, 8]} />
            <meshStandardMaterial color={stripeColor} roughness={0.4} />
        </mesh>
        {/* Dots */}
        {[0, 1, 2, 3].map(i => {
            const a = (i / 4) * Math.PI * 2;
            return (
                <mesh key={i} position={[Math.cos(a) * 0.68, 0.4, Math.sin(a) * 0.68]}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.5} />
                </mesh>
            );
        })}
    </group>
);

// ── Lantern (Chinese New Year) ────────────────────────────────────────────────

const Lantern3D = ({ color = '#ff0000', scale = 1 }) => (
    <group scale={[scale, scale, scale]}>
        {/* Top cap */}
        <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.3, 0.45, 0.2, 8]} />
            <meshStandardMaterial color="#1a0000" metalness={0.3} roughness={0.7} />
        </mesh>
        {/* Paper body */}
        <mesh castShadow>
            <capsuleGeometry args={[0.5, 1, 4, 12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} transparent opacity={0.88} />
        </mesh>
        {/* Ribs */}
        {[0, 1, 2, 3].map(i => (
            <mesh key={i} position={[0, -0.2 + i * 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.5, 0.025, 6, 16]} />
                <meshStandardMaterial color="#660000" />
            </mesh>
        ))}
        {/* Bottom cap */}
        <mesh position={[0, -0.75, 0]}>
            <cylinderGeometry args={[0.45, 0.3, 0.2, 8]} />
            <meshStandardMaterial color="#1a0000" metalness={0.3} roughness={0.7} />
        </mesh>
        {/* Tassel strands */}
        {[-0.1, 0, 0.1].map((x, i) => (
            <mesh key={i} position={[x, -1.4, 0]}>
                <cylinderGeometry args={[0.02, 0.01, 0.8, 4]} />
                <meshStandardMaterial color="#FFD700" />
            </mesh>
        ))}
        <pointLight color="#FF6600" intensity={4} distance={18} decay={2} />
    </group>
);

// ── Shared animated object wrapper ────────────────────────────────────────────

const FestiveObject = ({ data }: { data: any }) => {
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.elapsedTime;

        if (data.type === 'lantern') {
            ref.current.position.y += data.speed * 0.008;
            if (ref.current.position.y > 65) ref.current.position.y = -20;
            ref.current.rotation.z = Math.sin(t * 0.8 + data.id) * 0.12;
            ref.current.rotation.y += 0.003;
        } else if (data.type === 'diya') {
            ref.current.position.y = -1.8 + Math.sin(t * 2 + (data.offset || 0)) * 0.03;
        } else if (data.type === 'rabbit') {
            const hopCycle = (t * data.speed + data.offset) % (Math.PI * 2);
            const hop = Math.max(0, Math.sin(hopCycle)) * 1.2;
            ref.current.position.y = -2 + hop;
            // Lean forward on hop
            ref.current.rotation.x = hop > 0.1 ? -0.2 : 0;
            // Slowly wander
            ref.current.rotation.y = Math.sin(t * 0.3 + data.offset) * 0.5;
        }
    });

    const startY = data.type === 'lantern' ? data.y : (data.type === 'diya' ? -1.8 : -2);

    return (
        <group ref={ref} position={[data.x, startY, data.z]}>
            {data.type === 'lantern' && (
                <Lantern3D color={data.id % 3 === 0 ? '#ff0000' : data.id % 3 === 1 ? '#d42426' : '#FF8C00'} scale={data.scale * 0.7} />
            )}
            {data.type === 'diya' && <Diya3D scale={data.scale * 0.8} />}
            {data.type === 'rabbit' && <Rabbit3D scale={data.scale} />}
            {data.type === 'egg' && (
                <group position={[0, -1.3, 0]}>
                    <EasterEgg3D color={data.color} stripeColor={data.stripeColor} />
                </group>
            )}
        </group>
    );
};
