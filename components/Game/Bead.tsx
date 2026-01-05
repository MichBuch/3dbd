import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import * as THREE from 'three';
import { Player } from '@/store/gameStore';

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
const createPatternTexture = (type: 'easter' | 'xmas', colorHex: string) => {
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
    const meshRef = useRef<Mesh>(null);
    const targetY = position[1];
    const startY = targetY + 10;
    const initialized = useRef(false);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        if (!initialized.current) {
            meshRef.current.position.set(position[0], startY, position[2]);
            initialized.current = true;
        }
        const currentY = meshRef.current.position.y;
        if (Math.abs(currentY - targetY) > 0.01) {
            meshRef.current.position.y = THREE.MathUtils.lerp(currentY, targetY, 10 * delta);
        } else {
            meshRef.current.position.y = targetY;
        }
    });

    const beadRadius = 0.35 * scale;

    // Determine visuals based on Skin
    let finalColor = new THREE.Color(color);
    let roughness = isWinning ? 0.1 : 0.3;
    let metalness = isWinning ? 0.9 : 0.4;
    let emissiveIntensity = isWinning ? 0.8 : 0;

    // Geometry Selection
    let geometry = skin === 'rubik'
        ? <boxGeometry args={[beadRadius * 1.5, beadRadius * 1.5, beadRadius * 1.5]} /> // Cube
        : <sphereGeometry args={[beadRadius, 32, 32]} />;

    let map: THREE.Texture | null = null;
    let bumpMap: THREE.Texture | null = null;
    let bumpScale = 0.02;

    if (skin === 'tennis') {
        const hexColor = player === 'white' ? '#ffffff' : '#ccff00';
        finalColor = new THREE.Color(hexColor);
        map = createTennisTexture(hexColor, '3DBD') || null;
        bumpMap = map;
        bumpScale = 0.08; // Fluffier
        roughness = 1.0;
        metalness = 0.0;
        if (isWinning) {
            emissiveIntensity = 0.4;
            finalColor.multiplyScalar(1.2);
        }
    } else if (skin === 'easter') {
        const hexColor = player === 'white' ? '#FFB7B2' : '#B5EAD7';
        finalColor = new THREE.Color(hexColor);
        map = createPatternTexture('easter', hexColor) || null;
        roughness = 0.5;
        metalness = 0.1;
    } else if (skin === 'xmas') {
        const hexColor = player === 'white' ? '#D42426' : '#165B33';
        finalColor = new THREE.Color(hexColor);
        map = createPatternTexture('xmas', hexColor) || null;
        metalness = 0.9;
        roughness = 0.1;
        if (isWinning) emissiveIntensity = 1.0;
    } else if (skin === 'wood') {
        map = createWoodTexture(color) || null;
        roughness = 0.8;
        metalness = 0.0;
        if (isWinning) emissiveIntensity = 0.3;
    } else if (skin === 'rubik') {
        // Rubik logic
        map = createRubikTexture(player === 'white' ? '#ffffff' : '#ff0000') || null;
        roughness = 0.2; // Plastic
        metalness = 0.1;
        if (isWinning) emissiveIntensity = 0.5;
    }

    if (skin === 'default') {
        if (isWinning) finalColor.multiplyScalar(1.2);
        else finalColor.multiplyScalar(0.9);
    }

    const scaleY = (skin === 'easter') ? 1.3 : 1;

    return (
        <mesh
            ref={meshRef}
            position={position}
            scale={[1, scaleY, 1]}
            castShadow
            receiveShadow
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
    );
};
