# CLAUDE.md

## Language

Use **US English** spelling in this project (e.g., "initialize", "serialize", "color"). This is enforced by `typos` in pre-commit hooks.

## Project Overview

This is an ESM-only port of [gray-matter](https://github.com/jonschlinkert/gray-matter) - a library for parsing front-matter from strings or files.

## Tech Stack

- **Build**: tsdown
- **Test**: vitest (in-source testing)
- **YAML**: @std/yaml (from JSR, bundled)
- **Type Check**: tsgo (typescript-go)

## Testing

This project uses in-source vitest tests. Tests are written at the bottom of source files using:

```typescript
if (import.meta.vitest) {
  describe("my module", () => {
    it("should work", () => {
      expect(true).toBe(true);
    });
  });
}
```

**Important**: Do NOT destructure from `import.meta.vitest`. The test globals (`describe`, `it`, `expect`, etc.) are available globally via `vitest/globals`.

### Property-Based Testing with fast-check

This project uses `@fast-check/vitest` for property-based testing. Import it dynamically within the test block:

```typescript
if (import.meta.vitest) {
  const { fc, test } = await import("@fast-check/vitest");

  describe("my module", () => {
    // Regular test
    it("should work for specific case", () => {
      expect(myFunc("hello")).toBe("HELLO");
    });

    // Property-based test
    test.prop([fc.string()])("should work for any string", (input) => {
      expect(typeof myFunc(input)).toBe("string");
    });
  });
}
```

Property-based tests are useful for:

- Round-trip serialization (parse → stringify → parse)
- Input equivalence (Buffer vs string)
- Edge case discovery (prototype pollution, special characters)

## Commands

- `pnpm run test` - Run tests
- `pnpm run typecheck` - Type check with tsgo
- `pnpm run build` - Build with tsdown
- `pnpm run lint` - Lint with oxlint

## TypeScript Patterns

### Minimize Use of `as` Type Assertions

Avoid using `as` for type assertions whenever possible. Prefer these alternatives:

#### 1. Use validation functions for external data

When parsing external data (JSON, YAML, user input), use validation/coercion functions instead of `as`:

```typescript
// Good - validates and coerces to correct type
const data = toRecord(JSON.parse(str));
const lang = toBuiltinLanguage(input);

// Avoid - unsafe, no runtime validation
const data = JSON.parse(str) as Record<string, unknown>;
const lang = input as BuiltinLanguage;
```

#### 2. Use type guards for narrowing

When narrowing union types, use type guard functions:

```typescript
// Good - type guard with runtime check
function isGrayMatterFile(val: unknown): val is GrayMatterFile {
  return isObject(val) && "content" in val && "data" in val;
}

if (isGrayMatterFile(file)) {
  // file is now typed as GrayMatterFile
  console.log(file.content);
}

// Avoid - assertion without validation
const fileObj = file as GrayMatterFile;
```

#### 3. Use helper functions for property access

When accessing properties on unknown objects, use helper functions:

```typescript
// Good - safe property access with defaults
const language = getStringProp(input, "language");
const content = getStringProp(input, "content", "");

// Avoid - unsafe assertion
const language = (input as { language?: string }).language ?? "";
```

#### 4. When `as` IS acceptable

- `as const satisfies` - for preserving literal types (see below)
- Test code - when intentionally testing edge cases with invalid types
- After exhaustive type guards - when TypeScript can't infer the narrowed type

### Use `as const satisfies` for Object/Function Definitions

When defining objects or functions that should conform to a type while preserving literal types, use `as const satisfies`:

```typescript
// Good - preserves literal types while ensuring type conformance
const engines = {
  yaml,
  json,
  javascript,
} as const satisfies Engines;

const ALIASES = {
  js: "javascript",
  yaml: "yaml",
  yml: "yaml",
} as const satisfies Record<string, BuiltinLanguage>;

// Avoid - loses literal type information
const engines: Engines = { yaml, json, javascript };
```

### Use `== null` for Nullish Checks

Prefer `== null` over `=== undefined || === null` for checking both `undefined` and `null`:

```typescript
// Good - concise idiom that checks both undefined and null
if (data == null) {
  return defaultValue;
}

// Avoid - verbose and unnecessary
if (data === undefined || data === null) {
  return defaultValue;
}
```

### Prefer `??` over `||` for Default Values

Use nullish coalescing (`??`) instead of logical OR (`||`) when providing default values, unless you intentionally want to treat empty strings, `0`, or `false` as falsy:

```typescript
// Good - only falls back for null/undefined
const name = input ?? "default";
const count = options.count ?? 0;

// Avoid - empty string, 0, false are treated as falsy
const name = input || "default"; // "" becomes "default"
const count = options.count || 0; // 0 becomes 0 (works by accident)

// Exception: when you WANT to treat empty string as falsy
const language = file.language || opts.language; // "" should fall back
```

## Dependency Management

All dependencies MUST be managed via pnpm catalog in `pnpm-workspace.yaml`:

```yaml
catalogs:
  dev:
    "@fast-check/vitest": ^0.2.0
    "@types/node": ^24.0.3
    tsdown: ^0.19.0
    vitest: ^4.0.15
  jsr:
    "@std/yaml": jsr:@std/yaml@^1
  release:
    bumpp: ^10.2.3
```

In `package.json`, reference catalogs:

```json
{
  "devDependencies": {
    "@fast-check/vitest": "catalog:dev",
    "@std/yaml": "catalog:jsr",
    "@types/node": "catalog:dev",
    "tsdown": "catalog:dev"
  }
}
```

**Never** add dependencies directly with version numbers in `package.json`. Always:

1. Add the version to the appropriate catalog in `pnpm-workspace.yaml`
2. Reference it with `catalog:<catalog-name>` in `package.json`

## JSR Dependencies

JSR packages (like `@std/yaml`) use the `jsr:` protocol in the catalog:

```yaml
catalogs:
  jsr:
    "@std/yaml": jsr:@std/yaml@^1
```
