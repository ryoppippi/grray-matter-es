# Git Workflow

## Commits with Pre-commit Hooks

When running git commands that trigger pre-commit hooks (like `git commit`), use:

```bash
nix develop -c git commit -m "your message"
```

This ensures `tsgo` and other Nix-provided tools are available during hook execution.
