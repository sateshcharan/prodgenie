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
}
