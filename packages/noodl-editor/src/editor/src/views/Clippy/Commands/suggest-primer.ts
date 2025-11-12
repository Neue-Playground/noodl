export function getType(name: string) {
  // Simple mapping for suggestion command; return a short type name
  if (!name) return 'unknown';
  if (typeof name !== 'string') return 'unknown';
  const lower = name.toLowerCase();
  if (lower.includes('group')) return 'group';
  if (lower.includes('page')) return 'page';
  return name;
}

export const suggestPrimer = `You are an assistant that suggests UI improvements and components based on the provided UI tree. Respond with a JSON array of suggestions.`;
