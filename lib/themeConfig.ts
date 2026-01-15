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

export const THEME_CONFIG: Record<string, { base: string, white: string, black: string, skin?: 'default' | 'tennis' | 'easter' | 'xmas' | 'wood' | 'rubik' }> = {
    dark: { base: '#222222', white: '#ffffff', black: '#444444', skin: 'default' },
    black_white: { base: '#1a1a1a', white: '#ffffff', black: '#000000', skin: 'default' },
    moonball: { base: '#000000', white: '#FFFF00', black: '#FF0000', skin: 'default' }, // Yellow/Red for balls
    wood: { base: '#5D4037', white: '#D7CCC8', black: '#3E2723', skin: 'wood' },
    tennis: { base: '#2E8B57', white: '#ccff00', black: '#ffffff', skin: 'tennis' },
    xmas: { base: '#1a472a', white: '#ff0000', black: '#00ff00', skin: 'xmas' },
    easter: { base: '#FFF8E7', white: '#FFB7B2', black: '#B5EAD7', skin: 'easter' },
    winter: { base: '#F0F8FF', white: '#87CEFA', black: '#4682B4', skin: 'default' },
    snow: { base: '#FFFFFF', white: '#E0FFFF', black: '#B0E0E6', skin: 'default' },
    starry: { base: '#0B1026', white: '#FFFFD4', black: '#4B0082', skin: 'default' },
    space: { base: '#000000', white: '#FDFD96', black: '#552222', skin: 'default' },
    beach: { base: '#FFE5B4', white: '#FF6F61', black: '#40E0D0', skin: 'default' },
    halloween: { base: '#1C1C1C', white: '#FF7518', black: '#5C2C90', skin: 'default' },
    rubik: { base: '#000000', white: '#ffffff', black: '#ff0000', skin: 'rubik' },
    chinese_new_year: { base: '#8B0000', white: '#FFD700', black: '#FF0000', skin: 'default' },
    diwali: { base: '#FF6F00', white: '#FFD54F', black: '#FF6F00', skin: 'default' },
    toys: { base: '#87CEEB', white: '#FFFF00', black: '#FF0000', skin: 'default' },
    route66: { base: '#3E2723', white: '#FFD700', black: '#8B4513', skin: 'default' },
    area51: { base: '#000000', white: '#39FF14', black: '#111111', skin: 'default' },
    pickleball: { base: '#1E90FF', white: '#CCFF00', black: '#2F4F4F', skin: 'default' }, // Blue Court
    padel: { base: '#4169E1', white: '#FFFF00', black: '#20B2AA', skin: 'default' }, // Padel Blue
    rugby: { base: '#006400', white: '#FFFFFF', black: '#8B0000', skin: 'default' }, // Grass Green
    cozy: { base: '#3E2723', white: '#FFE4C4', black: '#5D4037', skin: 'default' }, // Warm Wood
};
