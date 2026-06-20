export function normalizeMarkdown(text: string): string {
  return text
    .replace(/^'''([\w-]*)\s*$/gm, '```$1')
    .replace(/^｀｀｀([\w-]*)\s*$/gm, '```$1');
}
