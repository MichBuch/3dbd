'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import { AnimatedModel } from '../AnimatedModel';
// Helper to generate a procedural sand texture safely
const useSandTexture = () => {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);

    // Use effect to generate texture only on client
    useMemo(() => { // actually useMemo is fine if we check window, but usually texture generation is side-effecty.
        if (typeof window === 'undefined') return;

        const width = 1024; // High res
        const height = 1024;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Fill with base warm sand color
        context.fillStyle = '#4b3d32'; // Sand base
        context.fillRect(0, 0, width, height);

        const imageData = context.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const random = Math.random();

            if (random > 0.95) {
                // White/Grey Grain (Quartz)
                const val = 200 + Math.random() * 55;
                data[i] = val;
                data[i + 1] = val;
                data[i + 2] = val;
            } else if (random < 0.02) {
                // Black/Dark Grain (Basalt)
                const val = Math.random() * 50;
                data[i] = val;
                data[i + 1] = val;
                data[i + 2] = val;
            } else if (random > 0.85 && random < 0.88) {
                // Reddish Grain (Iron/Clay)
                data[i] = 180 + Math.random() * 50;
                data[i + 1] = 80 + Math.random() * 50;
                data[i + 2] = 50 + Math.random() * 40;
            } else {
                // Standard Sand Noise
                const noise = (Math.random() - 0.5) * 40;
                data[i] = Math.min(255, Math.max(0, data[i] + noise));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
            }
        }

        context.putImageData(imageData, 0, 0);
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(64, 64); // Repeat to keep grains small
        setTexture(tex);
    }, []);

    return texture;
};

import { FullMoon, Agent3D, ShootingStar, PassingAircraft, Satellite, SpaceXRocket, Cactus, Rock, Snake, Hoverboard, DryBush, Hill, SpaceDebris, Galaxy } from './Area51Extras';

const PLANET_RADIUS = 1200;

// Helper to place objects on the planet surface
const PlanetObject = ({ x, z, children, yOffset = 0 }: { x: number, z: number, children: React.ReactNode, yOffset?: number }) => {
    // Convert flat (x, z) to spherical rotation
    // Moving forward (-Z) -> Rotate negative around X axis?
    // Z is forward/back. Angle = z / Radius.
    const xAngle = z / PLANET_RADIUS;
    const zAngle = -x / PLANET_RADIUS; // X is left/right. Rotate around Z.

    return (
        <group rotation={[xAngle, 0, zAngle]}>
            <group position={[0, PLANET_RADIUS + yOffset, 0]}>
                {children}
            </group>
        </group>
    );
};

export const Area51Background = () => {
    const sandTexture = useSandTexture();

    // Generate Objects: Fixed set of Hangars and Aliens
    const objects = useMemo(() => {
        return [
            { id: 1, type: 'hangar', x: -60, zStart: -100 },
            { id: 2, type: 'hangar', x: 50, zStart: -250 },
            { id: 3, type: 'hangar', x: -40, zStart: -450 },
            { id: 4, type: 'alien', x: -50, zStart: -90 },
            { id: 5, type: 'alien', x: 60, zStart: -240 },
        ];
    }, []);

    // Refined Scenery: Vegetation, Rocks, Snakes, Hills
    const scenery = useMemo(() => {
        // ... (re-running previous scenery upgrade since it failed last time)
        const cacti = [...Array(60)].map((_, i) => ({
            x: (Math.random() - 0.5) * 800,
            z: -50 - Math.random() * 600,
            type: 'cactus'
        }));
        const bushes = [...Array(150)].map((_, i) => ({
            x: (Math.random() - 0.5) * 900,
            z: 50 - Math.random() * 900,
            type: 'bush'
        }));
        const rocks = [...Array(600)].map((_, i) => ({
            x: (Math.random() - 0.5) * 1200,
            z: 100 - Math.random() * 1200,
            scale: 0.5 + Math.random() * 1.5,
            type: 'rock'
        }));
        const hills = [...Array(6)].map((_, i) => ({
            x: (Math.random() - 0.5) * 800,
            z: -100 - Math.random() * 500, // Visible horizon
            scale: 1.5 + Math.random() * 2,
            type: 'hill'
        }));
        const snakes = [...Array(15)].map((_, i) => ({
            x: (Math.random() - 0.5) * 500,
            z: -100 - Math.random() * 400,
            type: 'snake'
        }));
        return [...cacti, ...bushes, ...rocks, ...snakes, ...hills];
    }, []);

    return (
        <group>
            {/* BLACK VOID - NO FOG */}
            <color attach="background" args={['#000000']} />

            {/* --- SKY GROUP --- */}
            <group position={[0, 0, 0]}>
                <ambientLight intensity={0.6} color="#88AAFF" />

                {/* GALAXIES - Huge and Distant */}
                <Galaxy position={[-400, 300, -800]} rotation={[0.5, 0.2, 0]} scale={12} />
                <Galaxy position={[500, 400, -1000]} rotation={[-0.2, 0, 0.5]} scale={15} />
                <Galaxy position={[0, 700, -600]} rotation={[0, 0, 0]} scale={8} />

                {/* STARS LAYER 1: Distant Field (No fade for visibility) */}
                <Stars radius={2500} depth={500} count={60000} factor={80} saturation={1} fade={false} speed={1} />

                {/* STARS LAYER 2: Bright Foreground */}
                <Stars radius={1500} depth={100} count={8000} factor={180} saturation={0} fade speed={5} />

                {/* Sky Traffic */}
                <group scale={5}><FullMoon /></group>
                <ShootingStar />
                <PassingAircraft />
                <Satellite />
                <SpaceXRocket />
                <SpaceDebris />

                {/* MOTHERSHIP (Replacing BannerUFO) */}
                <MothershipUFO />

                <WhizzingUFOs />
            </group>

            {/* ... Ground Group (PlanetObject mapping) ... */}
            {/* ... Need to ensure Hills are rendered in the map loop ... */}

            <group position={[0, -PLANET_RADIUS - 2, 0]}>
                <mesh receiveShadow rotation={[0, 0, 0]}>
                    <sphereGeometry args={[PLANET_RADIUS, 256, 256]} />
                    {sandTexture ? (
                        <meshStandardMaterial
                            map={sandTexture}
                            bumpMap={sandTexture}
                            bumpScale={4}
                            color="#4b3d32"
                            roughness={0.9}
                            metalness={0.1}
                        />
                    ) : (
                        <meshStandardMaterial color="#4b3d32" roughness={1} />
                    )}
                </mesh>

                {objects.map((obj) => (
                    <PlanetObject key={obj.id} x={obj.x} z={obj.zStart}>
                        <Area51Object data={{ ...obj, zStart: 0, x: 0 }} />
                    </PlanetObject>
                ))}

                {/* SCENERY */}
                {scenery.map((item, i) => (
                    <PlanetObject key={i} x={item.x} z={item.z}>
                        {item.type === 'cactus' && <Cactus position={[0, 0, 0]} />}
                        {item.type === 'bush' && <DryBush />}
                        {item.type === 'rock' && <Rock scale={(item as any).scale || 1} />}
                        {item.type === 'snake' && <Snake />}
                        {item.type === 'hill' && <Hill scale={(item as any).scale} />}
                    </PlanetObject>
                ))}

                {/* Crashed Ships... */}
                <PlanetObject x={60} z={-20}><CrashedUFO /></PlanetObject>
                <PlanetObject x={-60} z={-40}><CrashedRoadster /></PlanetObject>
            </group>
        </group>
    );
};

// ... (Sub-components: CrashedRoadster, WhizzingUFOs, SingleWhizzingUFO, CrashedUFO stay same) ...
// ... REPLACING BannerUFO with MothershipUFO ...

const MothershipUFO = () => {
    const group = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (!group.current) return;
        const t = state.clock.elapsedTime;
        // Slow rotation
        group.current.rotation.y = t * 0.1;
        // Hover
        group.current.position.y = 80 + Math.sin(t * 0.5) * 5;
    });

    return (
        <group ref={group} position={[0, 80, -300]}>
            {/* Main Disc */}
            <mesh>
                <cylinderGeometry args={[40, 10, 5, 32]} />
                <meshStandardMaterial color="#222" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Dome */}
            <mesh position={[0, 2, 0]}>
                <sphereGeometry args={[15, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#39FF14" emissive="#39FF14" emissiveIntensity={0.5} transparent opacity={0.8} />
            </mesh>
            {/* Ring Lights */}
            {[...Array(12)].map((_, i) => (
                <mesh key={i} position={[Math.cos(i * Math.PI / 6) * 35, 0, Math.sin(i * Math.PI / 6) * 35]}>
                    <sphereGeometry args={[2]} />
                    <meshBasicMaterial color="#00FFFF" />
                </mesh>
            ))}
            {/* Beam */}
            <mesh position={[0, -20, 0]}>
                <cylinderGeometry args={[5, 15, 40, 32, 1, true]} />
                <meshBasicMaterial color="#39FF14" transparent opacity={0.1} side={THREE.DoubleSide} />
            </mesh>
        </group>
    )
}

// ... (Area51Object stays same) ...

const Area51Object = ({ data }: { data: any }) => {
    const { preferences } = useGameStore();
    const ref = useRef<THREE.Group>(null);
    // Use local animation only around the 0,0 center provided by PlanetObject
    const zPos = useRef(0);

    useFrame((state, delta) => {
        if (!ref.current) return;
        const speed = (preferences.themeSpeed || 1) * 20;

        // Move Forward - simplistic linear move, ignoring curvature for short distances
        // Ideally should update "PlanetObject" rotation, but for small animations locally it's fine.
        // Or if 'alien' walks far, they might clip.
        // Let's assume Hangars are static. Aliens walk locally.

        if (data.type === 'alien') {
            zPos.current += speed * delta;
            if (zPos.current > 50) zPos.current = -50;
            ref.current.position.z = zPos.current;
        }
    });

    return (
        <group ref={ref}>
            {/* --- HANGAR ONLY --- */}
            {data.type === 'hangar' && (
                <group>
                    {/* QUONSET HUT - FULL CYLINDER (Buried) */}
                    {/* To ensure full roof is visible, we render full cylinder. Bottom half is underground. */}
                    <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[10, 10, 30, 32, 1, false, 0, Math.PI * 2]} />
                        <meshStandardMaterial color="#444" roughness={0.6} metalness={0.4} side={THREE.DoubleSide} />
                    </mesh>

                    {/* FRONT WALL (Z = +14.9) */}
                    <group position={[0, 0, 14.9]}>
                        {/* Gray Semicircle Wall - Full Circle to match */}
                        <mesh rotation={[0, 0, 0]}>
                            <circleGeometry args={[9.8, 32, 0, Math.PI * 2]} />
                            <meshStandardMaterial color="#333" roughness={0.8} side={THREE.DoubleSide} />
                        </mesh>

                        {/* Open Door Emitting Yellow Light */}
                        <mesh position={[0, 3.5, 0.3]}>
                            <planeGeometry args={[10, 7]} />
                            <meshBasicMaterial color="#FFD700" />
                        </mesh>

                        {/* Light emanating from door */}
                        <pointLight position={[0, 4, 3]} color="#FFD700" intensity={5} distance={35} decay={2} />
                    </group>

                    {/* BACK WALL (Z = -14.9) - DARK */}
                    <group position={[0, 0, -14.9]}>
                        <mesh rotation={[0, Math.PI, 0]}>
                            <circleGeometry args={[10, 32, 0, Math.PI]} />
                            <meshBasicMaterial color="#111" side={THREE.DoubleSide} />
                        </mesh>
                    </group>

                    {/* HANGAR GUARDS */}
                    <Agent3D position={[-6, 0, 16]} />
                    <Agent3D position={[6, 0, 16]} />
                </group>
            )
            }

            {/* --- ALIEN (Walking on Hoverboard) --- */}
            {data.type === 'alien' && (
                <group position={[0, 0.5, 0]}> {/* Lift up for hover effect */}
                    <Hoverboard />
                    <group position={[0, 0.3, 0]}> {/* Stand on board */}
                        <AnimatedModel
                            path="/assets/models/grey_alien_idle.glb"
                            scale={2}
                            rotation={[0, Math.PI, 0]} // Face forward
                            animationName="mixamo.com"
                            speed={1} // Slower bobbing
                        />
                    </group>
                </group>
            )}
        </group >
    );
};



const CrashedRoadster = () => {
    return (
        <group rotation={[Math.PI / 2.2, 0, 0.5]}>
            {/* Car Body - Red Tesla */}
            <group>
                {/* Main Body */}
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[3, 1.5, 6]} />
                    <meshStandardMaterial color="#D00000" metalness={0.7} roughness={0.2} />
                </mesh>
                {/* Cabin */}
                <mesh position={[0, 1, -0.5]}>
                    <boxGeometry args={[2.8, 1.2, 3]} />
                    <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
                </mesh>
                {/* Wheels (Sticking out) */}
                <mesh position={[1.6, -0.5, 2]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.8, 0.8, 0.5, 16]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                <mesh position={[-1.6, -0.5, 2]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.8, 0.8, 0.5, 16]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                <mesh position={[1.6, -0.5, -2]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.8, 0.8, 0.5, 16]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                <mesh position={[-1.6, -0.5, -2]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.8, 0.8, 0.5, 16]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
            </group>

            {/* Impact Debris/Smoke */}
            {[...Array(5)].map((_, i) => (
                <mesh key={i} position={[(Math.random() - 0.5) * 5, 3 + Math.random() * 5, (Math.random() - 0.5) * 5]}>
                    <dodecahedronGeometry args={[0.5 + Math.random()]} />
                    <meshStandardMaterial color="#555" transparent opacity={0.6} />
                </mesh>
            ))}
        </group>
    )
}

const WhizzingUFOs = () => {
    // Create a few UFOs that zoom by at different intervals
    const ufoCount = 3;
    return (
        <group>
            {[...Array(ufoCount)].map((_, i) => (
                <SingleWhizzingUFO key={i} index={i} />
            ))}
        </group>
    );
}

const SingleWhizzingUFO = ({ index }: { index: number }) => {
    const ref = useRef<THREE.Group>(null);
    const speed = 60 + Math.random() * 40; // Very fast
    const yHeight = 40 + Math.random() * 30;
    const zDepth = -100 - Math.random() * 200;

    useFrame((state, delta) => {
        if (!ref.current) return;
        ref.current.position.x += speed * delta;

        // Reset if off screen right
        if (ref.current.position.x > 200) {
            ref.current.position.x = -200 - Math.random() * 300; // Random delay
            ref.current.position.y = 40 + Math.random() * 30;
            ref.current.position.z = -50 - Math.random() * 200;
        }

        // Rotate
        ref.current.rotation.z += delta * 5;
        ref.current.rotation.y += delta * 2;
    });

    return (
        <group ref={ref} position={[-200 - index * 100, yHeight, zDepth]}>
            <mesh>
                <cylinderGeometry args={[2, 0.5, 0.5, 16]} />
                <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={2} />
            </mesh>
        </group>
    )
}

const CrashedUFO = () => {
    return (
        <group rotation={[0.4, 0.5, 0.2]}>
            {/* Dynamic lighting from crash */}
            <pointLight color="#39FF14" intensity={8} distance={25} decay={2} />

            {/* Main Saucer - Tilted and half-buried */}
            <group>
                {/* The Dome */}
                <mesh position={[0, 1.5, 0]}>
                    <sphereGeometry args={[3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial color="#333" metalness={0.9} roughness={0.2} />
                </mesh>
                {/* The Disk */}
                <mesh>
                    <cylinderGeometry args={[9, 6, 2, 32]} />
                    <meshStandardMaterial color="#555" metalness={0.8} roughness={0.3} />
                </mesh>
            </group>

            {/* Smoke / Debris */}
            {[...Array(6)].map((_, i) => (
                <mesh key={i} position={[(Math.random() - 0.5) * 12, 1 + Math.random() * 3, (Math.random() - 0.5) * 12]} rotation={[Math.random(), Math.random(), Math.random()]}>
                    <dodecahedronGeometry args={[0.3 + Math.random() * 0.5]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
            ))}
        </group>
    );
};
