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
    skin?: 'default' | 'tennis' | 'easter' | 'xmas' | 'coin';
}

// Texture Cache to prevent memory leaks and lag
const textureCache: Record<string, THREE.CanvasTexture> = {};

const createTennisTexture = (colorHex: string, text: string) => {
    const key = `${colorHex}-${text}`;
    if (textureCache[key]) return textureCache[key];

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256; // Rectangular for UV mapping approximation
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Base Color
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 512, 256);

    // 2. Fuzz/Noise (Random dots)
    for (let i = 0; i < 50000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        ctx.fillRect(x, y, 2, 2);
    }

    // 3. Tennis Lines (Approximation: Sine waves)
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#ffffff';
    ctx.lineCap = 'round';

    // Wave 1
    ctx.beginPath();
    for (let x = 0; x <= 512; x++) {
        const y = 128 + Math.sin(x * 0.025) * 60;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 4. Branding
    ctx.save();
    ctx.translate(256, 128); // Center
    ctx.rotate(-0.2); // Slight tile
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, -40); // slightly above center curve
    ctx.restore();

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

        // Generate Texture
        map = createTennisTexture(hexColor, '3DBD') || null;
        bumpMap = map; // Reuse for bump to give depth to lines/text

        roughness = 1.0; // Very fuzzy
        metalness = 0.0;

        if (isWinning) {
            emissiveIntensity = 0.4;
            finalColor.multiplyScalar(1.2);
        }
    } else if (skin === 'easter') {
        // Egg Shape
        geometry = <sphereGeometry args={[beadRadius, 32, 32]} />;
        // Scale Y in the mesh prop below
        roughness = 0.5; // Matte egg shell
        metalness = 0.1;
    } else if (skin === 'xmas') {
        // Shiny Baubles
        metalness = 1.0;
        roughness = 0.0;
        if (isWinning) emissiveIntensity = 1.0;
    } else if (skin === 'coin') {
        // Coins (Cylinders)
        geometry = <cylinderGeometry args={[beadRadius, beadRadius, 0.15 * scale, 32]} />;
        metalness = 0.8;
        roughness = 0.2;
        // Coin needs rotation to lie flat or stand up? Standard 3D connect 4 beads are spheres. 
        // If we make them coins, they might stack oddly. Let's make them thick "checkers".
        // Rotate 90 deg optionally or just lie flat.
    }

    // Default adjustment for winning/non-winning if not overridden
    if (skin === 'default') {
        if (isWinning) finalColor.multiplyScalar(1.2);
        else finalColor.multiplyScalar(0.9);
    }

    // Scale adjustments for shapes
    const scaleY = skin === 'easter' ? 1.3 : 1;
    const rotationX = skin === 'coin' ? Math.PI / 2 : 0; // Stand coins up? Or lie flat? Lie flat = stack.

    return (
        <mesh
            ref={meshRef}
            position={position}
            scale={[1, scaleY, 1]}
            rotation={[rotationX, 0, 0]}
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
