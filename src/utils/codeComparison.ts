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
    
    // The user convention is that multiple answers are separated by ".," 
    // (a period ending the previous answer, then a comma).
    // We split by this delimiter to get all acceptable variations.
    const possibleSolutions = solutionCode.split(/.,\s*/);

    for (const sol of possibleSolutions) {
        let cleanSol = sol.trim();
        // Remove trailing dot from the solution option if present, 
        // as it's likely punctuation for the sentence, not the code.
        if (cleanSol.endsWith('.')) {
            cleanSol = cleanSol.slice(0, -1);
        }

        const normSolution = normalizeCode(cleanSol);

        // Also normalize the user code by removing a potentially added trailing dot
        // (to be forgiving if they typed it like the sentence).
        let cleanUser = normUser;
        if (cleanUser.endsWith('.')) {
            cleanUser = cleanUser.slice(0, -1);
        }

        console.log('User (norm):', cleanUser);
        console.log('Solution fragment (norm):', normSolution);

        if (cleanUser === normSolution) {
            return true;
        }
    }

    return false;
}
