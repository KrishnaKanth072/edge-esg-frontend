# Git Hooks Setup

## Installation

To enable these hooks locally, run:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

Or use the Makefile:

```bash
make setup
```

## Available Hooks

- `pre-commit`: Checks for hardcoded passwords, API keys, and secrets before allowing commits

## What Gets Checked

- Hardcoded passwords
- API keys (20+ character strings)
- Private keys
- AWS credentials
- Other sensitive data patterns

## Best Practices

Always use environment variables for sensitive data:
- `NEXT_PUBLIC_*` for client-side variables
- Regular env vars for server-side only
- Never commit `.env.local` files
