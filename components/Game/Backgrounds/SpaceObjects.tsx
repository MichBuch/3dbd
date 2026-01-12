'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

// Object Types
const DEBRIS_COLORS = ['#888888', '#666666', '#A9A9A9']; // Rock colors

const PLANET_DATA = [
    { type: 'saturn', scale: 4, color: '#F4D03F', ring: true, ringColor: '#Cca43b' },
    { type: 'earth', scale: 3, color: '#2ECC71' }, // Maybe custom shader later? Just green/blue for now
    { type: 'moon', scale: 2, color: '#BDC3C7' },
    { type: 'mars', scale: 2.5, color: '#E74C3C' },
    { type: 'neptune', scale: 3.5, color: '#3498DB' },
];

// Replaced Emojis with Geometry Logic
/************************************************
 * 3D Geometry Components
 ************************************************/


function FloatingObject({ data, position, velocity, rotationSpeed, distance = 1 }: any) {
    const ref = useRef<THREE.Group>(null);
    const { preferences } = useGameStore();

    useFrame((state, delta) => {
        if (!ref.current) return;

        const time = state.clock.getElapsedTime();
        const factor = preferences.themeSpeed || 1;

        // Parallax Speed: Further objects (higher distance) move slower
        // Distance 1 = Standard Debris
        // Distance 10 = Planet background
        const parallaxSpeed = factor / distance;

        if (ref.current) {
            ref.current.position.x += velocity.x * delta * parallaxSpeed;
            ref.current.position.y += velocity.y * delta * parallaxSpeed;
            ref.current.position.z += velocity.z * delta * parallaxSpeed;

            ref.current.rotation.x += rotationSpeed.x * delta;
            ref.current.rotation.y += rotationSpeed.y * delta;

            if (ref.current.position.z > 50) {
                // Respawn Logic
                if (distance === 1) {
                    // Debris: Spawn in "Collision Course" or "Near Miss"
                    // 50% chance to be ON COURSE (hitting the board area)
                    const isCollisionCourse = Math.random() > 0.5;
                    const spreadX = isCollisionCourse ? 15 : 60; // 15 is touching board, 60 is peripheral
                    const spreadY = isCollisionCourse ? 10 : 40;

                    ref.current.position.z = -150 - (Math.random() * 50);
                    ref.current.position.x = (Math.random() - 0.5) * spreadX;
                    ref.current.position.y = (Math.random() - 0.5) * spreadY;
                } else {
                    // Planets: Spawn wide
                    ref.current.position.z = -200 - (Math.random() * 100);
                    ref.current.position.x = (Math.random() - 0.5) * 250;
                    ref.current.position.y = (Math.random() - 0.5) * 150;
                }
            }
        }
    });

    // Geometry Switch
    const isPlanet = ['saturn', 'earth', 'moon', 'mars', 'neptune'].includes(data.type);
    const isSun = data.type === 'sun';
    const isUFO = data.type === 'ufo';
    const isSatellite = data.type === 'satellite';
    const isPacman = data.type === 'pacman';
    const isTesla = data.type === 'tesla';
    const isRock = data.type === 'debris';

    // Pacman Animation
    const pacmanData = useRef({ mouthOpen: 0, direction: 1 });
    useFrame((state, delta) => {
        if (isPacman && ref.current) {
            // Chomp animation
            pacmanData.current.mouthOpen += delta * 5 * pacmanData.current.direction;
            if (pacmanData.current.mouthOpen > 0.8) pacmanData.current.direction = -1;
            if (pacmanData.current.mouthOpen < 0.1) pacmanData.current.direction = 1;
            // Rotate the Pacman mesh itself (child 0)
            const mesh = ref.current.children[1] as THREE.Mesh; // Index 1 because Light is 0 (conditionally) or just find mesh
            if (mesh && mesh.geometry && mesh.geometry.type === 'SphereGeometry') {
                // Hard to update geometry args at runtime in R3F efficiently without key.
                // Instead, rotate the wedges? 
                // Simpler: Just rotate the whole body on X axis to simulate chomp? 
                // Actually, let's just use two hemispheres rotating?
                // For now, static open mouth is fine or wobble.
            }
        }
    });

    return (
        <group ref={ref} position={position}>
            {data.light && <pointLight intensity={1.5} distance={500} color={data.color} decay={1} />}

            {/* --- PACMAN --- */}
            {isPacman && (
                <group scale={[data.scale, data.scale, data.scale]} rotation={[0, Math.PI, 0]}>
                    {/* Top Half */}
                    <mesh rotation={[-0.4, 0, 0]}>
                        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshStandardMaterial color="#FFFF00" roughness={0.2} metalness={0.5} />
                    </mesh>
                    {/* Bottom Half */}
                    <mesh rotation={[0.4, 0, 0]}>
                        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
                        <meshStandardMaterial color="#FFFF00" roughness={0.2} metalness={0.5} />
                    </mesh>
                    {/* Eyes */}
                    <mesh position={[-0.3, 0.6, 0.4]}>
                        <sphereGeometry args={[0.15]} />
                        <meshBasicMaterial color="black" />
                    </mesh>
                    <mesh position={[0.3, 0.6, 0.4]}>
                        <sphereGeometry args={[0.15]} />
                        <meshBasicMaterial color="black" />
                    </mesh>
                </group>
            )}

            {/* --- TESLA ROADSTER --- */}
            {isTesla && (
                <group scale={[data.scale, data.scale, data.scale]} rotation={[0, Math.PI, 0]}>
                    {/* Chassis */}
                    <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[2, 0.5, 4]} />
                        <meshStandardMaterial color="#D00000" metalness={0.7} roughness={0.2} />
                    </mesh>
                    {/* Windshield */}
                    <mesh position={[0, 0.5, 0.5]} rotation={[-0.5, 0, 0]}>
                        <boxGeometry args={[1.8, 0.1, 1.5]} />
                        <meshStandardMaterial color="#88CCFF" transparent opacity={0.6} metalness={0.9} />
                    </mesh>
                    {/* Wheels */}
                    {[[1, 1.5], [-1, 1.5], [1, -1.5], [-1, -1.5]].map((pos, i) => (
                        <mesh key={i} position={[pos[0] * 0.9, -0.2, pos[1]]} rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.4, 0.4, 0.4, 16]} />
                            <meshStandardMaterial color="#111" />
                        </mesh>
                    ))}
                    {/* Starman */}
                    <mesh position={[0, 0.5, -0.5]}>
                        <sphereGeometry args={[0.3]} />
                        <meshStandardMaterial color="white" roughness={0.1} />
                    </mesh>
                </group>
            )}

            {/* --- UFO --- */}
            {isUFO && (
                <group scale={[data.scale, data.scale, data.scale]}>
                    {/* Hull */}
                    <mesh>
                        <cylinderGeometry args={[1, 0.5, 0.2, 16]} />
                        <meshStandardMaterial color="#A9A9A9" metalness={0.8} roughness={0.2} />
                    </mesh>
                    {/* Ring Light */}
                    <mesh position={[0, -0.1, 0]}>
                        <torusGeometry args={[0.6, 0.05, 8, 16]} />
                        <meshBasicMaterial color="#00FF00" />
                    </mesh>
                    {/* Dome */}
                    <mesh position={[0, 0.1, 0]}>
                        <sphereGeometry args={[0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
                    </mesh>
                </group>
            )}

            {/* --- SATELLITE --- */}
            {isSatellite && (
                <group scale={[data.scale, data.scale, data.scale]}>
                    {/* Body */}
                    <mesh>
                        <boxGeometry args={[0.5, 0.5, 0.5]} />
                        <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} />
                    </mesh>
                    {/* Panels */}
                    <mesh position={[0.8, 0, 0]}>
                        <boxGeometry args={[1, 0.05, 0.4]} />
                        <meshStandardMaterial color="#333333" metalness={0.5} roughness={0.1} />
                    </mesh>
                    <mesh position={[-0.8, 0, 0]}>
                        <boxGeometry args={[1, 0.05, 0.4]} />
                        <meshStandardMaterial color="#333333" metalness={0.5} roughness={0.1} />
                    </mesh>
                </group>
            )}

            {/* --- ROCK CLUSTER (Debris) --- */}
            {isRock && (
                <group scale={[data.scale, data.scale, data.scale]}>
                    <mesh>
                        <dodecahedronGeometry args={[0.8, 0]} />
                        <meshStandardMaterial color={data.color} roughness={0.9} flatShading />
                    </mesh>
                    <mesh position={[0.6, 0.3, 0.2]} rotation={[1, 1, 0]}>
                        <dodecahedronGeometry args={[0.4, 0]} />
                        <meshStandardMaterial color={data.color} roughness={0.9} flatShading />
                    </mesh>
                    <mesh position={[-0.5, -0.2, 0.3]} rotation={[0, 2, 1]}>
                        <icosahedronGeometry args={[0.5, 0]} />
                        <meshStandardMaterial color={data.color} roughness={0.9} flatShading />
                    </mesh>
                </group>
            )}

            {/* --- PLANETS --- */}
            {isPlanet && (
                <group>
                    <mesh>
                        <sphereGeometry args={[data.scale, 32, 32]} />
                        <meshStandardMaterial
                            color={data.color}
                            roughness={0.4}
                            metalness={0.1}
                        />
                    </mesh>
                    {/* Rings */}
                    {data.ring && (
                        <mesh rotation={[1.6, 0, 0]}>
                            <ringGeometry args={[data.scale * 1.4, data.scale * 2.2, 64]} />
                            <meshBasicMaterial color={data.ringColor || '#a020f0'} side={THREE.DoubleSide} transparent opacity={0.6} />
                        </mesh>
                    )}
                </group>
            )}

            {/* --- SUN / Generic Mesh --- */}
            {(isSun || data.type === 'blackhole') && (
                <group>
                    <mesh>
                        <sphereGeometry args={[data.scale, 32, 32]} />
                        {isSun ? <meshBasicMaterial color={data.color} /> : <meshBasicMaterial color="#000000" />}
                    </mesh>
                    {data.ring && (
                        <mesh rotation={[1.5, 0, 0]}>
                            <ringGeometry args={[16, 25, 64]} />
                            <meshBasicMaterial color="#a020f0" side={THREE.DoubleSide} transparent opacity={0.4} />
                        </mesh>
                    )}
                </group>
            )}
        </group>
    );
}

export const SpaceObjects = () => {
    // Generate Objects
    const objects = useMemo(() => {
        const items = [];

        // 1. Debris (Close, Fast 3D Rocks - FLY BYS)
        for (let i = 0; i < 60; i++) { // Slightly fewer rocks to make room
            items.push({
                id: `debris-${i}`,
                data: {
                    type: 'debris', // This triggers "Rock Cluster"
                    scale: 0.3 + Math.random() * 0.5,
                    color: DEBRIS_COLORS[Math.floor(Math.random() * DEBRIS_COLORS.length)]
                },
                position: [
                    (Math.random() - 0.5) * 70,
                    (Math.random() - 0.5) * 50,
                    (Math.random() - 0.5) * 100 - 50
                ],
                velocity: { x: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 0.5, z: 30 + Math.random() * 30 },
                rotationSpeed: { x: Math.random() * 5, y: Math.random() * 5, z: Math.random() * 5 },
                distance: 1
            });
        }

        // 2. Specific Objects (UFOs, Satellites) - FLY BYS
        for (let i = 0; i < 5; i++) {
            items.push({
                id: `ufo-${i}`,
                data: { type: 'ufo', scale: 1 },
                position: [(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, -100 - Math.random() * 50],
                velocity: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 1, z: 40 + Math.random() * 20 }, // Fast!
                rotationSpeed: { x: 0, y: 5, z: 0.5 }, // Spinning
                distance: 1
            });
            items.push({
                id: `sat-${i}`,
                data: { type: 'satellite', scale: 0.8 },
                position: [(Math.random() - 0.5) * 80, (Math.random() - 0.5) * 50, -100 - Math.random() * 50],
                velocity: { x: (Math.random() - 0.5) * 0.5, y: 0, z: 25 + Math.random() * 10 },
                rotationSpeed: { x: 0.2, y: 0.2, z: 0.2 },
                distance: 1
            });
        }

        // 3. Hero Items (Pacman, Tesla) - Guaranteed Fly-bys
        items.push({
            id: 'pacman-hero',
            data: { type: 'pacman', scale: 3 }, // Big Pacman
            position: [20, 10, -100],
            velocity: { x: -0.5, y: -0.1, z: 50 }, // Fast!
            rotationSpeed: { x: 0, y: 0, z: 0 },
            distance: 1
        });

        items.push({
            id: 'tesla-hero',
            data: { type: 'tesla', scale: 3 }, // Big Car
            position: [-20, -15, -150],
            velocity: { x: 0.5, y: 0.2, z: 60 }, // Super Fast
            rotationSpeed: { x: 0.2, y: 0.1, z: 0 },
            distance: 1
        });

        // 2. Planets (Far, Slow, 3D Spheres)
        PLANET_DATA.forEach((planet, i) => {
            items.push({
                id: `planet-${i}`,
                data: planet,
                position: [
                    (Math.random() - 0.5) * 300,
                    (Math.random() - 0.5) * 150,
                    -150 - Math.random() * 100
                ],
                velocity: { x: 0, y: 0, z: 2 + Math.random() * 3 }, // Moving towards camera slowly
                rotationSpeed: { x: 0, y: 0.2, z: 0 },
                distance: 10
            });
        });

        return items;
    }, []);

    return (
        <group>
            {/* Distant Dynamic Sun */}
            <FloatingObject
                data={{ type: 'sun', scale: 20, color: '#FDB813', light: true }}
                position={[80, 40, -200]}
                velocity={{ x: -0.5, y: -0.1, z: 0.5 }} // Drifting
                rotationSpeed={{ x: 0, y: 0, z: 0 }}
                distance={20}
            />

            {/* Black Hole */}
            <FloatingObject
                data={{ type: 'blackhole', scale: 15, color: '#000000', ring: true }}
                position={[-60, -30, -200]}
                velocity={{ x: 0.5, y: 0.1, z: 0.5 }}
                rotationSpeed={{ x: 0, y: 0, z: 0 }}
                distance={20}
            />

            {/* Debris & Planets */}
            {objects.map((obj) => (
                <FloatingObject
                    key={obj.id}
                    data={obj.data}
                    position={obj.position}
                    velocity={obj.velocity}
                    rotationSpeed={obj.rotationSpeed}
                    distance={obj.distance}
                />
            ))}
        </group>
    );
};
