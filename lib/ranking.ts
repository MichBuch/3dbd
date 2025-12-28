export function calculateScore(
    difficulty: 'easy' | 'medium' | 'hard',
    winnerScore: number,
    loserScore: number,
    mode: 'ai' | 'pvp'
): number {
    let basePoints = 0;

    // Difficulty Multiplier
    switch (difficulty) {
        case 'easy': basePoints = 10; break;
        case 'medium': basePoints = 25; break;
        case 'hard': basePoints = 50; break;
    }

    // PvP Multiplier (Harder than AI generally)
    if (mode === 'pvp') basePoints *= 1.5;

    // Score Margin Bonus
    const margin = Math.max(0, winnerScore - loserScore);
    const marginBonus = margin * 5; // 5 points per bead diff

    return Math.round(basePoints + marginBonus);
}
