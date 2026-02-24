import { Stars, Cloud, Sparkles, Sky } from '@react-three/drei';
import { useGameStore } from '@/store/gameStore';

export const ThemeBackground = () => {
    const { theme } = useGameStore();

    switch (theme.id) {
        case 'starry':
            return <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />;

        case 'space':
            return (
                <>
                    <Stars radius={300} depth={50} count={20000} factor={7} saturation={0} fade speed={0.5} />
                    <color attach="background" args={['#000000']} />
                    <fog attach="fog" args={['#000000', 30, 100]} />
                </>
            );

        case 'xmas':
            return (
                <>
                    <color attach="background" args={['#0f2f1e']} /> {/* Dark Green Base */}
                    <fog attach="fog" args={['#0f2f1e', 10, 50]} />
                    <Sparkles count={500} scale={[20, 20, 20]} size={6} speed={0.4} opacity={0.8} color="#ffffff" /> {/* Snow */}
                    <Sparkles count={50} scale={[15, 15, 15]} size={10} speed={0.2} opacity={0.5} color="#ff0000" /> {/* Red lights */}
                    <Sparkles count={50} scale={[15, 15, 15]} size={10} speed={0.2} opacity={0.5} color="#00ff00" /> {/* Green lights */}
                </>
            );

        case 'snow':
        case 'winter': // Alias
            return (
                <>
                    <color attach="background" args={['#87CEEB']} />
                    <fog attach="fog" args={['#87CEEB', 20, 60]} />
                    <Sparkles count={1000} scale={[20, 20, 20]} size={4} speed={0.8} opacity={0.7} color="#ffffff" />
                    <Cloud position={[-10, 10, -20]} opacity={0.5} />
                    <Cloud position={[10, 5, -20]} opacity={0.5} />
                </>
            );

        case 'easter':
            return (
                <>
                    <color attach="background" args={['#FFF8E7']} />
                    <fog attach="fog" args={['#FFF8E7', 20, 50]} />
                    <Sky sunPosition={[100, 20, 100]} turbidity={0.5} rayleigh={0.5} />
                    {/* Pastel confetti/particles */}
                    <Sparkles count={100} scale={[15, 15, 15]} size={10} speed={0.4} color="#FFB7B2" />
                    <Sparkles count={100} scale={[15, 15, 15]} size={10} speed={0.3} color="#B5EAD7" />
                    <Sparkles count={100} scale={[15, 15, 15]} size={10} speed={0.5} color="#E0BBE4" />
                </>
            );

        case 'beach':
            return (
                <>
                    <color attach="background" args={['#87CEFA']} />
                    <Sky sunPosition={[0, 10, -100]} />
                    <Cloud position={[0, 10, -30]} opacity={0.7} speed={0.2} segments={20} />
                </>
            );

        case 'halloween':
            return (
                <>
                    <color attach="background" args={['#1a0505']} />
                    <fog attach="fog" args={['#1a0505', 10, 40]} />
                    <Sparkles count={200} scale={[20, 20, 20]} size={5} speed={0.2} color="#ff6600" opacity={0.5} /> {/* Orange Dust */}
                    <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={2} />
                </>
            );

        case 'space':
            return (
                <>
                    <color attach="background" args={['#000000']} />
                    {/* Atari Style: Sparse, bright white pixels */}
                    <Stars radius={100} depth={0} count={300} factor={6} saturation={0} fade speed={0} />
                    {/* Maybe a retro grid at the bottom? */}
                    <gridHelper args={[200, 20]} position={[0, -20, 0]} rotation={[0, 0, 0]}>
                        <lineBasicMaterial attach="material" color="#00ff00" opacity={0.2} transparent />
                    </gridHelper>
                </>
            );

        case 'rubik':
            return (
                <>
                    <color attach="background" args={['#101010']} />
                    <fog attach="fog" args={['#101010', 20, 60]} />
                    {/* Subtle grid to mimic the cube structure in the void */}
                    <gridHelper args={[100, 10]} position={[0, -10, 0]} rotation={[0, 0, 0]}>
                        <lineBasicMaterial attach="material" color="#333333" />
                    </gridHelper>
                </>
            );

        case 'tennis':
            return (
                <>
                    <color attach="background" args={['#2E8B57']} /> {/* SeaGreen Court */}
                    <fog attach="fog" args={['#2E8B57', 20, 60]} />
                    {/* Court lines or net effect could be added here, but keeping it simple for now */}
                    <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
                </>
            );

        case 'wood':
            return (
                <>
                    <color attach="background" args={['#3E2723']} /> {/* Dark Wood Color */}
                    <fog attach="fog" args={['#3E2723', 10, 40]} />
                    <Sparkles count={100} scale={[20, 20, 20]} size={6} speed={0.2} opacity={0.3} color="#D7CCC8" /> {/* Dust */}
                </>
            );

        case 'route66':
            return <color attach="background" args={['#1A0A30']} />;

        case 'black_white':
        case 'dark':
        default:
            return <color attach="background" args={['#000000']} />;
    }
};
