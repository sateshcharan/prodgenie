export class StringService {
  camelCase(str: string): string {
    return (str || '')
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/\s+([a-z])/g, (_, char) => char.toUpperCase())
      .replace(/\s+/g, '');
  }

  camelToNormal(text: string): string {
    return text.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  }

  prefixKeys = (
    keyToReplace: string,
    objectToPrefixIn: Record<string, any>
  ): Record<string, any> => {
    return Object.entries(objectToPrefixIn).reduce((acc, [key, value]) => {
      acc[`${keyToReplace}_${key}`] = value;
      return acc;
    }, {} as Record<string, any>);
  };

  similarityScore(a: string, b: string): number {
    const normalize = (str: string) => str.trim().toLowerCase();
    a = normalize(a);
    b = normalize(b);

    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;

    const distance = this.levenshteinDistance(a, b);
    return (maxLen - distance) / maxLen;
  }

  // Levenshtein distance algorithm
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
      new Array(b.length + 1).fill(0)
    );

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[a.length][b.length];
  }

  getInitials(text: string): string {
    return text.slice(0, 2).toUpperCase();
  }

  getNameWithoutExtension(text: string): string {
    return text.split('.')[0];
  }
}
