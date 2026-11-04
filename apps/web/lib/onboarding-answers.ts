export type Answers = Record<string, string | string[]>;

/** Keeps only plain string / string[] values so nothing odd gets persisted. */
export function sanitizeAnswers(input: unknown): Answers {
  const clean: Answers = {};
  if (!input || typeof input !== 'object') return clean;
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (typeof value === 'string') {
      clean[key.slice(0, 40)] = value.slice(0, 80);
    } else if (Array.isArray(value)) {
      clean[key.slice(0, 40)] = value
        .filter((v): v is string => typeof v === 'string')
        .slice(0, 12)
        .map((v) => v.slice(0, 80));
    }
  }
  return clean;
}
