/**
 * Normalizes code for comparison by removing comments and standardizing whitespace.
 */
export function normalizeCode(code: string): string {
    if (!code) return '';

    // 1. Remove single-line comments // ...
    let clean = code.replace(/\/\/.*$/gm, '');

    // 2. Remove multi-line comments /* ... */
    clean = clean.replace(/\/\*[\s\S]*?\*\//g, '');

    // 3. Replace multiple whitespace (spaces, tabs, newlines) with a single space
    // This makes the comparison very forgiving about formatting.
    clean = clean.replace(/\s+/g, ' ');

    // 4. Remove spaces around common symbols to be even more forgiving?
    // E.g. "x = 1" vs "x=1".
    // For now, let's stick to simple whitespace collapsing.

    // 5. Trim
    return clean.trim();
}

/**
 * Compares two code strings returning a similarity score or boolean.
 * Uses strict token comparison after normalization.
 */
export function compareCode(userCode: string, solutionCode: string): boolean {
    const normUser = normalizeCode(userCode);
    const normSolution = normalizeCode(solutionCode);

    console.log('User (norm):', normUser);
    console.log('Solution (norm):', normSolution);

    return normUser === normSolution;
}
