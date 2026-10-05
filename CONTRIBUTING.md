# Contributing to MiniSpeckit

Thank you for contributing to **MiniSpeckit**! We welcome improvements, fixes, and community presets.

## Guiding Principles
1. **Zero External Dependencies**: `bin/minispec.js` must remain pure native Node.js (>=18) with no npm dependencies.
2. **Token Efficiency**: Everything we build must minimize context consumption for AI agents. Single-file blueprints are preferred over multi-file fragmentation.
3. **Cross-Platform Parity**: Every command must run identically on Windows (PowerShell/CMD), macOS (zsh/bash), and Linux.
4. **Universal Agent Support**: Never lock into a single AI tool. Maintain first-class support for Claude Code, Cursor, Copilot, Antigravity, and Codex.

## Development & Testing
```bash
# Clone the repository
git clone https://github.com/saiganne/MiniSpeckit.git
cd MiniSpeckit

# Run automated tests
npm test

# Test the CLI locally
node bin/minispec.js --help
```

## Pull Request Process
1. Fork and create a feature branch.
2. Verify all tests pass with `npm test`.
3. Add test coverage in `test/cli.test.js` for new commands or flags.
4. Submit your PR with a clear summary of changes.
