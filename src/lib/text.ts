/** Lowercase without accents, so "martin" finds "Martín". */
export const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
