import { type BuiltinLanguage, getEngine } from "./engines.ts";

/**
 * Parse front matter string using the specified language engine
 */
export function parse(language: BuiltinLanguage, str: string): Record<string, unknown> {
  const engine = getEngine(language);
  return engine.parse(str);
}
