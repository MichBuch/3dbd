import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import * as THREE from 'three';

import { Player, useGameStore } from '@/store/gameStore';

interface BeadProps {
    position: [number, number, number];
    color: string;
    player: Player;
    isWinning?: boolean;
    scale?: number;
    skin?: 'default' | 'tennis' | 'easter' | 'xmas' | 'wood' | 'rubik';
}

// Texture Cache to prevent memory leaks and lag
const textureCache: Record<string, THREE.CanvasTexture> = {};

// Helper to create patterned textures
const createPatternTexture = (type: 'easter' | 'xmas' | 'space', colorHex: string) => {
    const key = `${type}-${colorHex}`;
    if (textureCache[key]) return textureCache[key];

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Base Color
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 512, 256);

    if (type === 'easter') {
        // Easter Egg: ZigZags and Spots
        ctx.fillStyle = 'rgba(255,255,255,0.3)';

        // ZigZag Band
        ctx.beginPath();
        ctx.moveTo(0, 100);
        for (let i = 0; i <= 512; i += 32) {
            ctx.lineTo(i, 100 + (i % 64 === 0 ? -20 : 20));
        }
        ctx.lineTo(512, 140);
        for (let i = 512; i >= 0; i -= 32) {
            ctx.lineTo(i, 140 + (i % 64 === 0 ? -20 : 20));
        }
        ctx.fill();

        // Dots
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 256;
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (type === 'xmas') {
        // Xmas Bauble: Stripes and Sparkle
        // Gold/Silver Stripes
        ctx.fillStyle = 'rgba(255,215,0, 0.5)'; // Gold
        ctx.fillRect(0, 50, 512, 20);
        ctx.fillRect(0, 180, 512, 20);

        // Snowflakes / Sparkles
        ctx.fillStyle = 'white';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 256;
            ctx.fillRect(x, y, 4, 4);
            ctx.fillRect(x + 1, y - 3, 2, 10); // Cross
            ctx.fillRect(x - 3, y + 1, 10, 2);
        }
    } else if (type === 'space') {
        // Space Pattern
        // Logic relies on strict color matching or player awareness. 
        // We know 'white' player sends #FDFD96. 
        // Let's broaden the check or use the passed color directly if it matches our "Moon" intention.
        const isMoon = colorHex === '#FDFD96' || colorHex === '#FFFF00' || colorHex === '#FFD700';

        // --- BASE COLOR ---
        // Moon: Bright Yellow (#FFFF00)
        // Mars: Deep Red (#552222)
        const baseColor = isMoon ? '#FFD700' : colorHex; // Force Gold/Yellow for Moon
        const shadowColor = isMoon ? '#8B8000' : '#330000'; // Dark Yellow vs Dark Red

        // Dark Side Gradient (Radial for spherical look)
        // Light moves from top-left (Bright) to bottom-right (Dark)
        const gradient = ctx.createRadialGradient(
            150, 80, 20,   // Inner Circle (Highlight source)
            256, 128, 300  // Outer Circle (Falloff)
        );
        gradient.addColorStop(0, isMoon ? '#FFFFE0' : '#FFFFD0');  // Bright Highlight
        gradient.addColorStop(0.2, baseColor); // Base color
        gradient.addColorStop(0.6, isMoon ? '#000000' : shadowColor); // Core Shadow (Deepest Dark)
        // Key Fix: Rim Light effect - Edge gets lighter again (Dark Grey)
        gradient.addColorStop(1, isMoon ? '#333333' : '#221111');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 256);

        // --- SURFACE NOISE ---
        ctx.fillStyle = isMoon ? 'rgba(200,200,160,0.15)' : 'rgba(255,100,0,0.1)';
        for (let i = 0; i < 1500; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 256;
            ctx.fillRect(x, y, 1, 1);
        }

        // --- CRATERS (Irregular & Realistic) ---
        const craters: { x: number, y: number, r: number }[] = [];
        const maxCraters = isMoon ? 20 : 30;
        // Light Side Crater Floor: Deeper Yellow/Gold instead of dark grey
        const craterFloor = isMoon ? 'rgba(218, 165, 32, 0.6)' : 'rgba(0,0,0,0.4)';
        const baseRimHighlight = isMoon ? 'rgba(255, 255, 230, 0.7)' : 'rgba(255,100,100,0.2)';
        // Light Side Rim Shadow: Golden Brown
        const baseRimShadow = isMoon ? 'rgba(184, 134, 11, 0.4)' : 'rgba(0,0,0,0.5)';
        const baseCraterFloor = craterFloor;

        let attempts = 0;
        while (craters.length < maxCraters && attempts < 400) {
            attempts++;
            const size = Math.random() * 25 + 10;
            const x = Math.random() * 512;
            const y = Math.random() * 256;

            // Strict Overlap Check
            let overlap = false;
            for (const c of craters) {
                const dx = c.x - x;
                const dy = c.y - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                // Allow slight overlap for compound craters? No, user wants distinct.
                if (dist < (c.r + size + 6)) {
                    overlap = true;
                    break;
                }
            }

            if (!overlap) {
                craters.push({ x, y, r: size });

                // Dynamic Lighting for Craters based on Terminator line
                // Light source at (150, 80)
                const distFromLight = Math.sqrt((x - 150) ** 2 + (y - 80) ** 2);
                let currentRimHighlight = baseRimHighlight;
                let currentRimShadow = baseRimShadow;
                let currentFloor = baseCraterFloor;

                if (isMoon && distFromLight > 180) {
                    // Dark Side Craters
                    // Rims should catch very faint light (rim light) or be dark
                    currentRimHighlight = 'rgba(60, 60, 60, 0.3)'; // Dark Grey Highlight
                    currentRimShadow = 'rgba(0, 0, 0, 0.9)'; // Pitch Black Shadow
                    currentFloor = 'rgba(10, 10, 10, 0.8)'; // Darker Floor
                }

                // Draw Irregular Crater Shape
                // We draw the main circle + 2-3 smaller offsets to distort it
                const drawIrregularCircle = (cx: number, cy: number, r: number, style: string) => {
                    ctx.fillStyle = style;
                    ctx.beginPath();
                    ctx.arc(cx, cy, r, 0, Math.PI * 2);
                    // Distort 1
                    ctx.arc(cx + r * 0.2, cy - r * 0.1, r * 0.9, 0, Math.PI * 2);
                    // Distort 2
                    ctx.arc(cx - r * 0.1, cy + r * 0.2, r * 0.85, 0, Math.PI * 2);
                    ctx.fill();
                };

                // 1. EJECTA (Rays) - Only for big ones
                // Reduce visibility on dark side
                if (size > 18) {
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.strokeStyle = (isMoon && distFromLight > 180) ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.08)';
                    ctx.lineWidth = 1;
                    const rays = Math.floor(Math.random() * 8) + 8;
                    for (let r = 0; r < rays; r++) {
                        const len = size * (1.8 + Math.random());
                        const ang = (Math.PI * 2 * r) / rays + (Math.random() * 0.5);
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
                        ctx.stroke();
                    }
                    ctx.restore();
                }

                // 2. RIM (Outer Highlight)
                ctx.beginPath();
                ctx.arc(x, y, size + 2.5, 0, Math.PI * 2); // Keep rim somewhat rounder for structure
                ctx.fillStyle = currentRimHighlight;
                ctx.fill();

                // 3. INNER SHADOW (Depth)
                ctx.beginPath();
                ctx.arc(x, y, size + 1, 0, Math.PI * 2);
                ctx.fillStyle = currentRimShadow;
                ctx.fill();

                // 4. CRATER FLOOR (The Pit) - Irregular
                drawIrregularCircle(x, y, size, currentFloor);

                // 5. INTERNAL SHADOW (Wall Shadow)
                ctx.save();
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.clip();
                ctx.beginPath();
                ctx.arc(x + size * 0.4, y + size * 0.3, size, 0, Math.PI * 2);
                // Update internal shadow for light side to be dark gold/brownish, not black
                ctx.fillStyle = (isMoon && distFromLight > 180)
                    ? 'rgba(0,0,0,0.8)' // Dark Side: Black
                    : (isMoon ? 'rgba(139, 69, 19, 0.4)' : 'rgba(0,0,0,0.35)'); // Light Side: SaddleBrown vs Default
                ctx.fill();
                ctx.restore();

                // 6. CENTRAL PEAK (Sometimes)
                if (size > 20 && Math.random() > 0.5) {
                    ctx.beginPath();
                    ctx.arc(x + 1, y + 1, size * 0.15, 0, Math.PI * 2);
                    ctx.fillStyle = (isMoon && distFromLight > 180) ? 'rgba(50,50,50,0.2)' : 'rgba(255,255,255,0.2)'; // Lit peak
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(x - 1, y - 1, size * 0.15, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(0,0,0,0.3)'; // Shadow side
                    ctx.fill();
                }
            }
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    textureCache[key] = texture;
    return texture;
};

// Helper for Tennis Texture
const createTennisTexture = (colorHex: string, text: string) => {
    const key = `tennis-${colorHex}-${text}`;
    if (textureCache[key]) return textureCache[key];

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Base Color
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 512, 256);

    // Tennis Seam (White Curve)
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 15;
    ctx.beginPath();
    // A wave pattern to look like the seam when wrapped - simplified sine wave approximation for wrapping
    ctx.moveTo(0, 128);
    ctx.bezierCurveTo(128, 0, 384, 256, 512, 128);
    ctx.stroke();

    // Noise/Fluff
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
        ctx.fillRect(x, y, 2, 2);
    }

    if (text) {
        ctx.fillStyle = '#00008b'; // Dark Blue
        ctx.font = 'italic bold 60px "Comic Sans MS", cursive, sans-serif'; // Cursive-ish
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.save();
        // Position on the "face" of the sphere approx
        ctx.translate(256, 64);
        ctx.fillText(text, 0, 0);
        ctx.translate(0, 128); // Bottom side too
        ctx.fillText(text, 0, 0);
        ctx.restore();
    }

    const texture = new THREE.CanvasTexture(canvas);
    textureCache[key] = texture;
    return texture;
};

// Helper for Wood Texture
const createWoodTexture = (colorHex: string) => {
    const key = `wood-${colorHex}`;
    if (textureCache[key]) return textureCache[key];

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Base Color
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 512, 512);

    // Wood Grain
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * 512;
        const width = Math.random() * 20 + 5;
        ctx.fillRect(x, 0, width, 512);

        // Knots?
        if (Math.random() > 0.8) {
            ctx.beginPath();
            ctx.arc(x, Math.random() * 512, Math.random() * 10, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Wavy lines
    ctx.strokeStyle = 'rgba(40, 20, 0, 0.1)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        const startX = Math.random() * 512;
        ctx.moveTo(startX, 0);
        ctx.bezierCurveTo(startX + 50, 150, startX - 50, 350, startX, 512);
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    textureCache[key] = texture;
    return texture;
};


// Rubik Texture Helper
const createRubikTexture = (colorHex: string) => {
    const key = `rubik-${colorHex}`;
    if (textureCache[key]) return textureCache[key];

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Black plastic background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 256, 256);

    // Colored Sticker
    ctx.fillStyle = colorHex;
    // Leave a margin for the black plastic edge
    ctx.fillRect(20, 20, 216, 216);

    // Gloss/highlight on sticker
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(20, 236);
    ctx.lineTo(236, 20);
    ctx.lineTo(236, 236);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    textureCache[key] = texture;
    return texture;
};

export const Bead = ({ position, color, player, isWinning = false, scale = 1, skin = 'default' }: BeadProps) => {
    const { theme } = useGameStore();
    const effectiveSkin = (theme.id === 'space' || theme.id === 'toys') ? theme.id : skin;

    const scaleY = (skin === 'easter') ? 1.3 : 1;
    const isSnow = theme.id === 'snow';

    const beadRadius = 0.35 * scale;

    // Get theme-specific emissive strength (default to 3.0 if not specified)
    const themeEmissiveStrength = (theme as any).emissiveStrength || 3.0;

    // Determine visuals based on Skin
    let finalColor = new THREE.Color(color);
    let roughness = isWinning ? 0.1 : 0.3;
    let metalness = isWinning ? 0.9 : 0.4;
    let emissiveIntensity = isWinning ? themeEmissiveStrength : 0; // Use theme-specific strength

    // Geometry Selection
    let geometry = effectiveSkin === 'rubik'
        ? <boxGeometry args={[beadRadius * 1.5, beadRadius * 1.5, beadRadius * 1.5]} /> // Cube
        : <sphereGeometry args={[beadRadius, 32, 32]} />;

    let map: THREE.Texture | null = null;
    let bumpMap: THREE.Texture | null = null;
    let bumpScale = 0.02;

    if (effectiveSkin === 'space') {
        // Space Pattern
        // Moon (White Player) -> Yellowish #FDFD96
        // Mars (Black Player) -> Red #440000
        const hexColor = player === 'white' ? '#FDFD96' : '#440000';
        finalColor = new THREE.Color(hexColor);
        map = createPatternTexture('space', hexColor) || null;
        bumpMap = map;
        bumpScale = 0.05;
        roughness = 0.9;

        if (isWinning) {
            // Theme already has high emissive strength (4.5), use it
            metalness = 0.5;
        } else {
            metalness = 0.1;
        }
    } else if (effectiveSkin === 'tennis') {
        const hexColor = player === 'white' ? '#ffffff' : '#ccff00';
        finalColor = new THREE.Color(hexColor);
        map = createTennisTexture(hexColor, '3DBD') || null;
        bumpMap = map;
        bumpScale = 0.08; // Fluffier
        roughness = 1.0;
        metalness = 0.0;
        if (isWinning) {
            // Tennis theme has moderate emissive (2.5)
            finalColor.multiplyScalar(1.5);
        }
    } else if (skin === 'easter') {
        const hexColor = player === 'white' ? '#FFB7B2' : '#B5EAD7';
        finalColor = new THREE.Color(hexColor);
        map = createPatternTexture('easter', hexColor) || null;
        roughness = 0.5;
        metalness = 0.1;
        // Easter theme has low emissive (1.5) - subtle glow
    } else if (skin === 'xmas') {
        const hexColor = player === 'white' ? '#D42426' : '#165B33';
        finalColor = new THREE.Color(hexColor);
        map = createPatternTexture('xmas', hexColor) || null;
        metalness = 0.9;
        roughness = 0.1;
        // Xmas theme has good emissive (3.5)
    } else if (skin === 'wood') {
        map = createWoodTexture(color) || null;
        roughness = 0.8;
        metalness = 0.0;
        // Wood theme has low emissive (2.0) - shouldn't glow too much
    } else if (skin === 'rubik') {
        // Rubik logic
        map = createRubikTexture(player === 'white' ? '#ffffff' : '#ff0000') || null;
        roughness = 0.2; // Plastic
        metalness = 0.1;
        // Rubik theme has moderate emissive (2.5)
    } else if (effectiveSkin === 'toys') {
        // High Gloss Plastic
        roughness = 0.05;
        metalness = 0.1;
        // Toys theme has low emissive (2.0)
        if (isWinning) {
            finalColor.multiplyScalar(2.0);
        }
    }

    if (skin === 'default') {
        if (isWinning) finalColor.multiplyScalar(1.5);
        else finalColor.multiplyScalar(0.9);
    }

    // FIX: Animate the GROUP so both the Bead and the Snow Cap move together.
    const groupRef = useRef<THREE.Group>(null);
    const targetY = position[1];
    const startY = targetY + 10;
    const initialized = useRef(false);

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        if (!initialized.current) {
            // Initialize Group position
            groupRef.current.position.set(position[0], startY, position[2]);
            initialized.current = true;
        }

        // Animate Group Y
        const currentY = groupRef.current.position.y;
        if (Math.abs(currentY - targetY) > 0.01) {
            groupRef.current.position.y = THREE.MathUtils.lerp(currentY, targetY, 10 * delta);
        } else {
            groupRef.current.position.y = targetY;
        }
    });

    return (
        <group ref={groupRef} scale={[1, scaleY, 1]}>
            <mesh
                castShadow
                receiveShadow
            // Mesh is now at local 0,0,0
            >
                {geometry}
                <meshStandardMaterial
                    color={(skin === 'rubik' || skin === 'wood' || skin === 'tennis' || skin === 'easter' || skin === 'xmas') ? undefined : finalColor}
                    map={map}
                    bumpMap={bumpMap}
                    bumpScale={bumpScale}
                    roughness={roughness}
                    metalness={metalness}
                    emissive={isWinning ? finalColor : undefined}
                    emissiveIntensity={emissiveIntensity}
                />
            </mesh>

            {/* Snow Cap for Snow Theme */}
            {isSnow && (
                <mesh position={[0, beadRadius * 0.4, 0]} rotation={[0, 0, 0]}>
                    <sphereGeometry args={[beadRadius * 1.02, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
                    <meshStandardMaterial color="#ffffff" roughness={1} metalness={0.1} />
                </mesh>
            )}
        </group>
    );
};
