/**
 * Normalizes code for comparison by removing comments and standardizing whitespace.
 */
/**
 * Normalizes code for comparison by removing comments, standardizing whitespace,
 * normalizing quotes and removing optional semicolons.
 */
export function normalizeCode(code: string): string {
    if (!code) return '';

    // 1. Remove single-line comments // ...
    let clean = code.replace(/\/\/.*$/gm, '');

    // 2. Remove multi-line comments /* ... */
    clean = clean.replace(/\/\*[\s\S]*?\*\//g, '');

    // 3. Normalize quotes (all to single quotes)
    clean = clean.replace(/"/g, "'");

    // 4. Remove all whitespace (including newlines) to be extremely forgiving
    // OR collapse multiple whitespace into one. 
    // Let's stick to collapsing to keep some token separation, 
    // BUT also remove spaces around symbols.
    clean = clean.replace(/\s+/g, ' ');

    // 5. Remove spaces around common punctuation/operators
    clean = clean.replace(/\s*([=+\-*/<>!&|{}[\];(),:])\s*/g, '$1');

    // 6. Remove trailing semicolons for forgiving ending
    clean = clean.replace(/;+$/, '');

    // 7. Trim
    return clean.trim();
}

/**
 * Compares two code strings returning a similarity score or boolean.
 * Uses strict token comparison after normalization.
 */
export function compareCode(userCode: string, solutionCode: string): boolean {
    if (!userCode || !solutionCode) return false;

    // The user convention is that multiple answers are separated by ".," 
    // (a period ending the previous answer, then a comma).
    // ESCAPED DOT: \.,
    const possibleSolutions = solutionCode.split(/\.,\s*/);

    for (const sol of possibleSolutions) {
        let cleanSol = sol.trim();

        // Remove trailing dot from the solution option if present, 
        // but ONLY if it seems to be sentence punctuation (at the very end).
        if (cleanSol.endsWith('.') && !cleanSol.endsWith('..')) {
            cleanSol = cleanSol.slice(0, -1);
        }

        const normSolution = normalizeCode(cleanSol);

        // Also normalize the user code
        let normUser = normalizeCode(userCode);

        // Final sanity check: if user added a trailing dot because they thought it was a sentence
        if (normUser.endsWith('.') && !normSolution.endsWith('.')) {
            normUser = normUser.slice(0, -1);
        }

        if (normUser === normSolution) {
            return true;
        }
    }

    return false;
}
