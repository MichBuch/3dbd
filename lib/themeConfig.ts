export const THEMES = [
    { id: 'area51', translationKey: 'themeArea51' },
    { id: 'beach', translationKey: 'themeBeach' },
    { id: 'black_white', translationKey: 'themeBlackWhite' },
    { id: 'chinese_new_year', translationKey: 'themeChineseNewYear' },
    { id: 'cozy', translationKey: 'themeCozy' },
    { id: 'dark', translationKey: 'themeDark' },
    { id: 'diwali', translationKey: 'themeDiwali' },
    { id: 'easter', translationKey: 'themeEaster' },
    { id: 'halloween', translationKey: 'themeHalloween' },
    { id: 'padel', translationKey: 'themePadel' },
    { id: 'pickleball', translationKey: 'themePickleball' },
    { id: 'route66', translationKey: 'themeRoute66' },
    { id: 'rubik', translationKey: 'themeRubik' },
    { id: 'rugby', translationKey: 'themeRugby' },
    { id: 'snow', translationKey: 'themeSnow' },
    { id: 'space', translationKey: 'themeSpace' },
    { id: 'starry', translationKey: 'themeStarry' },
    { id: 'tennis', translationKey: 'themeTennis' },
    { id: 'toys', translationKey: 'themeToys' },
    { id: 'winter', translationKey: 'themeWinter' },
    { id: 'wood', translationKey: 'themeWood' },
    { id: 'xmas', translationKey: 'themeXmas' },
    { id: 'moonball', translationKey: 'themeMoonBall' },
];

export const THEME_CONFIG: Record<string, {
    base: string,
    white: string,
    black: string,
    skin?: 'default' | 'tennis' | 'easter' | 'xmas' | 'wood' | 'rubik',
    emissiveStrength?: number  // Controls winning bead glow intensity (default: 3.0)
}> = {
    // Classic Themes
    dark: { base: '#222222', white: '#ffffff', black: '#555555', skin: 'default', emissiveStrength: 3.5 },
    black_white: { base: '#1a1a1a', white: '#ffffff', black: '#000000', skin: 'default', emissiveStrength: 3.0 },
    wood: { base: '#5D4037', white: '#F5DEB3', black: '#3E2723', skin: 'wood', emissiveStrength: 2.0 },

    // Party/Sport Ball Themes
    moonball: { base: '#000000', white: '#FFFF00', black: '#FF0000', skin: 'default', emissiveStrength: 4.0 },
    tennis: { base: '#2E8B57', white: '#CCFF00', black: '#ffffff', skin: 'tennis', emissiveStrength: 2.5 },

    // Holiday Themes
    xmas: { base: '#1a472a', white: '#ff0000', black: '#00ff00', skin: 'xmas', emissiveStrength: 3.5 },
    easter: { base: '#FFF8E7', white: '#FF69B4', black: '#87CEEB', skin: 'easter', emissiveStrength: 1.5 },
    halloween: { base: '#1C1C1C', white: '#FF7518', black: '#9D4EDD', skin: 'default', emissiveStrength: 4.0 }, // Brighter purple
    chinese_new_year: { base: '#8B0000', white: '#FFD700', black: '#FF0000', skin: 'default', emissiveStrength: 3.5 },
    diwali: { base: '#FF6F00', white: '#FFD700', black: '#FF4500', skin: 'default', emissiveStrength: 3.0 }, // Gold vs Deep Orange

    // Weather/Nature Themes
    winter: { base: '#F0F8FF', white: '#4169E1', black: '#1E90FF', skin: 'default', emissiveStrength: 1.8 }, // Royal blue vs Dodger blue
    snow: { base: '#FFFFFF', white: '#87CEEB', black: '#4682B4', skin: 'default', emissiveStrength: 1.5 },
    starry: { base: '#0B1026', white: '#FFFF99', black: '#9370DB', skin: 'default', emissiveStrength: 3.5 },
    beach: { base: '#FFE5B4', white: '#FF4500', black: '#0077BE', skin: 'default', emissiveStrength: 2.0 }, // Orange-red vs Deep blue
    cozy: { base: '#3E2723', white: '#FFA07A', black: '#8B4513', skin: 'default', emissiveStrength: 2.5 }, // Light salmon vs Saddle brown

    // Space/Tech Themes
    space: { base: '#000000', white: '#FDFD96', black: '#B22222', skin: 'default', emissiveStrength: 4.5 }, // Brighter mars red
    area51: { base: '#000000', white: '#00FF00', black: '#333333', skin: 'default', emissiveStrength: 5.0 }, // Pure green
    rubik: { base: '#000000', white: '#ffffff', black: '#ff0000', skin: 'rubik', emissiveStrength: 2.5 },
    toys: { base: '#87CEEB', white: '#FFFF00', black: '#FF0000', skin: 'default', emissiveStrength: 2.0 },
    route66: { base: '#3E2723', white: '#FFD700', black: '#CD853F', skin: 'default', emissiveStrength: 2.5 }, // Peru vs Gold

    // Sports Themes
    pickleball: { base: '#1E90FF', white: '#CCFF00', black: '#006400', skin: 'default', emissiveStrength: 2.5 }, // Dark green
    padel: { base: '#4169E1', white: '#FFFF00', black: '#228B22', skin: 'default', emissiveStrength: 2.5 }, // Forest green
    rugby: { base: '#006400', white: '#FFFFFF', black: '#8B0000', skin: 'default', emissiveStrength: 2.8 },
};
