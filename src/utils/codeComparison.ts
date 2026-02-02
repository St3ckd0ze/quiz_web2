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
 * Finds the first line that differs between user code and solution.
 * Returns 1-based line index, or null if they match.
 */
export function findFirstDiffLine(userCode: string, solutionCode: string): number | null {
    if (!userCode || !solutionCode) return null;

    const userLines = userCode.split('\n');
    const solLines = solutionCode.split('\n');

    // Remove empty lines at the end to avoid trailing newline issues
    while (userLines.length > 0 && userLines[userLines.length - 1].trim() === '') userLines.pop();
    while (solLines.length > 0 && solLines[solLines.length - 1].trim() === '') solLines.pop();

    const maxLines = Math.max(userLines.length, solLines.length);

    for (let i = 0; i < maxLines; i++) {
        const u = normalizeCode(userLines[i] || '');
        const s = normalizeCode(solLines[i] || '');

        if (u !== s) {
            return i + 1;
        }
    }

    return null;
}

/**
 * Compares two code strings returning a similarity score or boolean.
 * Uses strict token comparison after normalization.
 */
export function compareCode(userCode: string, solutionCode: string): boolean {
    if (!userCode || !solutionCode) return false;

    // The user convention is that multiple answers are separated by ".," 
    // (a period ending the previous answer, then a comma).
    const possibleSolutions = solutionCode.split(/\.,\s*/);

    for (const sol of possibleSolutions) {
        let cleanSol = sol.trim();

        if (cleanSol.endsWith('.') && !cleanSol.endsWith('..')) {
            cleanSol = cleanSol.slice(0, -1);
        }

        const normSolution = normalizeCode(cleanSol);
        let normUser = normalizeCode(userCode);

        if (normUser.endsWith('.') && !normSolution.endsWith('.')) {
            normUser = normUser.slice(0, -1);
        }

        if (normUser === normSolution) {
            return true;
        }
    }

    return false;
}
