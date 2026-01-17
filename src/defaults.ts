import type { GrayMatterOptions, ResolvedOptions } from "./types.ts";
import { arrayify } from "./utils.ts";

/**
 * Apply default options
 */
export function defaults(options?: GrayMatterOptions): ResolvedOptions {
  const delims = arrayify(options?.delimiters ?? "---");
  const delimiters: [string, string] =
    delims.length === 1 ? [delims[0]!, delims[0]!] : [delims[0]!, delims[1]!];

  return {
    ...options,
    delimiters,
    language: options?.language ?? "yaml",
  };
}
