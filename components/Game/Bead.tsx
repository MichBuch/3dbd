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
    skin?: 'default' | 'tennis' | 'easter' | 'xmas';
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
    ctx.lineWidth = 20;
    ctx.beginPath();
    // A wave pattern to look like the seam when wrapped
    ctx.moveTo(0, 128);
    ctx.bezierCurveTo(128, 0, 384, 256, 512, 128);
    ctx.stroke();

    if (text) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.save();
        ctx.translate(256, 128);
        ctx.fillText(text, 0, 0);
        ctx.restore();
    }

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
    let geometry = <sphereGeometry args={[beadRadius, 32, 32]} />;
    let map: THREE.Texture | null = null;
    let bumpMap: THREE.Texture | null = null;

    if (skin === 'tennis') {
        const hexColor = player === 'white' ? '#ff4444' : '#ccff00'; // Red vs Yellow-Green
        finalColor = new THREE.Color(hexColor);
        map = createTennisTexture(hexColor, '3DBD') || null;
        bumpMap = map;
        roughness = 1.0;
        metalness = 0.0;
        if (isWinning) {
            emissiveIntensity = 0.4;
            finalColor.multiplyScalar(1.2);
        }
    } else if (skin === 'easter') {
        const hexColor = player === 'white' ? '#FFB7B2' : '#B5EAD7'; // Pastel Red/Green
        finalColor = new THREE.Color(hexColor);
        map = createPatternTexture('easter', hexColor) || null;
        geometry = <sphereGeometry args={[beadRadius, 32, 32]} />;
        roughness = 0.5;
        metalness = 0.1;
    } else if (skin === 'xmas') {
        const hexColor = player === 'white' ? '#D42426' : '#165B33'; // Deep Red / Green
        finalColor = new THREE.Color(hexColor);
        map = createPatternTexture('xmas', hexColor) || null;
        metalness = 0.9; // Shiny
        roughness = 0.1;
        if (isWinning) emissiveIntensity = 1.0;
    }

    if (skin === 'default') {
        if (isWinning) finalColor.multiplyScalar(1.2);
        else finalColor.multiplyScalar(0.9);
    }

    const scaleY = skin === 'easter' ? 1.3 : 1;

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
                color={finalColor}
                map={map}
                bumpMap={bumpMap}
                bumpScale={0.02}
                roughness={roughness}
                metalness={metalness}
                emissive={isWinning ? finalColor : undefined}
                emissiveIntensity={emissiveIntensity}
            />
        </mesh>
    );
};
