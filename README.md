# grray-matter-es

ES-only [gray-matter](https://github.com/jonschlinkert/gray-matter) implementation.

## Installation

```bash
npm install grray-matter-es
```

## Usage

```typescript
import matter from "grray-matter-es";

const file = matter("---\ntitle: Hello\n---\nThis is content");
console.log(file.data); // { title: 'Hello' }
console.log(file.content); // 'This is content'
```

## Development

This project uses [Nix](https://nixos.org/) for development environment management.

### Prerequisites

- [Nix](https://nixos.org/download.html) with flakes enabled
- [direnv](https://direnv.net/) (optional but recommended)

### Setup

```bash
# Enter the development shell
nix develop

# Or with direnv
direnv allow
```

The development shell includes:

- Node.js 24
- pnpm 10
- oxlint / oxfmt (linting and formatting)
- gitleaks (secret detection)
- typos (spell checking)
- Pre-commit hooks (automatically installed)

### Scripts

```bash
# Run tests
pnpm test

# Build
pnpm build

# Lint
pnpm lint

# Format
pnpm format

# Release (bump version, tag, and push)
pnpm release
```

## License

MIT
