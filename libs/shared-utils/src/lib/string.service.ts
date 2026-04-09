export class StringService {
  static camelCase(str: string): string {
    return (str || '')
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/\s+([a-z])/g, (_, char) => char.toUpperCase())
      .replace(/\s+/g, '');
  }

  static camelToNormal(text: string): string {
    return text.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  }

  static trimKeys(
    obj: Record<string, any> | any[],
    keys: string[],
    options?: { toCamelCase?: boolean }
  ): Record<string, any> | any[] {
    const { toCamelCase = false } = options || {};

    if (Array.isArray(obj)) {
      return obj.map((item) => this.trimKeys(item, keys, options));
    } else if (typeof obj === 'object' && obj !== null) {
      const newObj: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (keys.includes(key) && typeof value === 'string') {
          // remove leading/trailing spaces and collapse multiple spaces
          let trimmed = value.replace(/\s+/g, ' ').trim();
          if (toCamelCase) trimmed = this.camelCase(trimmed);
          newObj[key] = trimmed;
        } else {
          newObj[key] = this.trimKeys(value, keys, options);
        }
      }
      return newObj;
    }
    return obj;
  }

  // prefixKeys = (
  //   keyToReplace: string,
  //   objectToPrefixIn: Record<string, any>
  // ): Record<string, any> => {
  //   return Object.entries(objectToPrefixIn).reduce((acc, [key, value]) => {
  //     acc[`${keyToReplace}_${key}`] = value;
  //     return acc;
  //   }, {} as Record<string, any>);
  // };

  static prefixKeys = (
    keyToReplace: string,
    objectToPrefixIn: Record<string, any>
  ): Record<string, any> => {
    const result: Record<string, any> = {};

    const helper = (obj: Record<string, any>, prefix: string) => {
      for (const [key, value] of Object.entries(obj)) {
        const newKey = `${prefix}_${key}`;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          helper(value, newKey); // recurse into nested object
        } else {
          result[newKey] = value;
        }
      }
    };

    helper(objectToPrefixIn, keyToReplace);
    return result;
  };

  static flattenObjectWith_ = (
    obj: Record<string, any>,
    parentKey = '',
    separator = '_'
  ): Record<string, any> => {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = parentKey ? `${parentKey}${separator}${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(
          result,
          this.flattenObjectWith_(value, newKey, separator)
        );
      } else {
        result[newKey] = value;
      }
    }
    return result;
  };

  static evaluateSimpleConcat(
    expression: string,
    source: Record<string, any>
  ): string {
    return expression
      .split('+')
      .map((part) => part.trim())
      .map(
        (path) => path.split('.').reduce((acc, key) => acc?.[key], source) ?? ''
      )
      .join(' ');
  }

  static similarityScore(a: string, b: string): number {
    const normalize = (str: string) => str.trim().toLowerCase();
    a = normalize(a);
    b = normalize(b);

    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;

    const distance = this.levenshteinDistance(a, b);
    return (maxLen - distance) / maxLen;
  }

  // Levenshtein distance algorithm
  static levenshteinDistance(a: string, b: string): number {
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

  static getInitials(text: string): string {
    return text.slice(0, 2).toUpperCase();
  }

  static getNameWithoutExtension(text: string): string {
    return text.split('.')[0];
  }

  static validateFileName(fileName: string): string | null {
    const trimmed = fileName.trim();

    if (trimmed.length === 0) {
      return 'File name cannot be empty';
    }

    if (trimmed.length > 100) {
      return 'File name too long';
    }

    const invalidChars = /[\\/:*?"<>|]/;
    if (invalidChars.test(trimmed)) {
      return 'File name contains invalid characters';
    }

    return null;
  }
}
