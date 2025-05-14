function normalize(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+([a-z])/g, (_, char) => char.toUpperCase())
    .replace(/\s+/g, '');
}

export { normalize };
