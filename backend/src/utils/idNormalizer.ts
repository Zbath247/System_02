/**
 * Normalizes Student ID / Staff ID.
 * - Converts Khmer digits (០-៩) to Latin digits (0-9).
 * - Strips unnecessary punctuation or whitespace.
 * - Converts to uppercase.
 */
export function normalizeIdentifier(input: string): string {
  if (!input) return '';

  const khmerDigits: { [key: string]: string } = {
    '០': '0', '១': '1', '២': '2', '៣': '3', '៤': '4',
    '៥': '5', '៦': '6', '៧': '7', '៨': '8', '៩': '9',
  };

  let normalized = input.trim();
  normalized = normalized.replace(/[០-៩]/g, (char) => khmerDigits[char] || char);
  normalized = normalized.replace(/\s+/g, '').toUpperCase();
  return normalized;
}

/**
 * Normalizes full name by standardizing Unicode normalization (NFC)
 * and collapsing multiple spaces.
 */
export function normalizeName(name: string): string {
  if (!name) return '';
  return name
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Robust bilingual name verification.
 * Checks whether user input matches registered Khmer name or English name.
 */
export function compareNames(submittedName: string, registeredKh: string, registeredEn: string): boolean {
  const cleanSubmitted = normalizeName(submittedName);
  const cleanKh = normalizeName(registeredKh);
  const cleanEn = normalizeName(registeredEn);

  if (!cleanSubmitted) return false;

  // Exact match with either Khmer or English name
  if (cleanSubmitted === cleanKh || cleanSubmitted === cleanEn) {
    return true;
  }

  // Also match reversed English name (e.g. "Sovann Sok" vs "Sok Sovann")
  const parts = cleanEn.split(' ');
  if (parts.length === 2) {
    const reversedEn = `${parts[1]} ${parts[0]}`;
    if (cleanSubmitted === reversedEn) {
      return true;
    }
  }

  return false;
}
