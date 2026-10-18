/**
 * Sanitizes CSV field values to prevent CSV formula injection (e.g. =, +, -, @)
 * and formats values with quotes if they contain commas, newlines, or quotes.
 */
export function sanitizeCsvField(value: any): string {
  if (value === null || value === undefined) {
    return '""';
  }

  let str = String(value);

  // CSV Formula injection protection:
  // If the cell begins with =, +, -, @, \t, \r, prepend a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape existing double quotes
  str = str.replace(/"/g, '""');

  return `"${str}"`;
}

/**
 * Builds a RFC 4180 compliant CSV string from an array of headers and rows.
 */
export function buildCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const headerLine = headers.map(sanitizeCsvField).join(',');
  const rowLines = rows.map((row) => row.map(sanitizeCsvField).join(','));
  return [headerLine, ...rowLines].join('\r\n');
}
