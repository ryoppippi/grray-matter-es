import { parse as yamlParse, stringify as yamlStringify } from "@std/yaml";
import type { Engine, GrayMatterOptions } from "./types.ts";

/**
 * Built-in language names
 */
export type BuiltinLanguage = "yaml" | "json";

/**
 * YAML engine using @std/yaml
 */
const yaml = {
  parse: (str: string): Record<string, unknown> => {
    const result = yamlParse(str);
    return (result as Record<string, unknown>) ?? {};
  },
  stringify: (data: Record<string, unknown>): string => {
    return yamlStringify(data as Record<string, unknown>);
  },
} as const satisfies Engine;

/**
 * JSON engine
 */
const json = {
  parse: (str: string): Record<string, unknown> => {
    return JSON.parse(str) as Record<string, unknown>;
  },
  stringify: (
    data: Record<string, unknown>,
    options?: GrayMatterOptions & { replacer?: null; space?: number },
  ): string => {
    const opts = { replacer: null, space: 2, ...options };
    return JSON.stringify(data, opts.replacer, opts.space);
  },
} as const satisfies Engine;

/**
 * Get engine by language name
 */
export function getEngine(language: BuiltinLanguage): Engine {
  switch (language) {
    case "yaml":
      return yaml;
    case "json":
      return json;
    default:
      throw new Error(`Unknown language: ${language satisfies never}`);
  }
}

if (import.meta.vitest) {
  const { fc, test } = await import("@fast-check/vitest");

  /** Arbitrary for YAML-safe values (no undefined, functions, symbols) */
  const yamlSafeValue = fc.oneof(
    fc.string(),
    fc.integer(),
    fc.double({ noNaN: true, noDefaultInfinity: true }),
    fc.boolean(),
    fc.constant(null),
  );

  /** Arbitrary for simple YAML-compatible objects */
  const yamlSafeObject = fc.dictionary(
    fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
    yamlSafeValue,
    { minKeys: 1, maxKeys: 5 },
  );

  describe("yaml engine", () => {
    it("should parse simple YAML", () => {
      const result = yaml.parse("title: Hello\ncount: 42");
      expect(result).toEqual({ title: "Hello", count: 42 });
    });

    it("should return empty object for null YAML", () => {
      const result = yaml.parse("null");
      expect(result).toEqual({});
    });

    it("should stringify object to YAML", () => {
      const result = yaml.stringify({ title: "Test", count: 10 });
      expect(result).toContain("title: Test");
      expect(result).toContain("count: 10");
    });

    test.prop([yamlSafeObject])("should round-trip parse/stringify for safe objects", (data) => {
      const stringified = yaml.stringify(data);
      const parsed = yaml.parse(stringified);
      expect(parsed).toEqual(data);
    });

    test.prop([fc.string({ minLength: 1, maxLength: 100 }), fc.integer()])(
      "should preserve string and number types",
      (str, num) => {
        const data = { str, num };
        const stringified = yaml.stringify(data);
        const parsed = yaml.parse(stringified);
        expect(parsed.str).toBe(str);
        expect(parsed.num).toBe(num);
      },
    );
  });

  describe("json engine", () => {
    it("should parse JSON", () => {
      const result = json.parse('{"title": "Hello", "count": 42}');
      expect(result).toEqual({ title: "Hello", count: 42 });
    });

    it("should stringify object to JSON", () => {
      const result = json.stringify({ title: "Test" });
      expect(JSON.parse(result)).toEqual({ title: "Test" });
    });

    it("should throw on invalid JSON", () => {
      expect(() => json.parse("not json")).toThrow();
    });

    test.prop([
      fc.record({
        title: fc.string(),
        count: fc.integer(),
        active: fc.boolean(),
      }),
    ])("should round-trip parse/stringify", (data) => {
      const stringified = json.stringify(data);
      const parsed = json.parse(stringified);
      expect(parsed).toEqual(data);
    });

    test.prop([
      fc.oneof(
        fc.string(),
        fc.integer(),
        fc.boolean(),
        fc.constant(null),
        fc.array(fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.constant(null))),
      ),
    ])("should handle common JSON values", (value) => {
      const wrapped = { value };
      const stringified = json.stringify(wrapped);
      const parsed = json.parse(stringified);
      expect(parsed).toEqual(wrapped);
    });
  });

  describe("getEngine", () => {
    it("should return yaml engine", () => {
      expect(getEngine("yaml")).toBe(yaml);
    });

    it("should return json engine", () => {
      expect(getEngine("json")).toBe(json);
    });
  });
}
