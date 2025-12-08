# Contributing to Quis

Thank you for your interest in contributing to Quis! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Add the upstream repository as a remote

```bash
git clone https://github.com/YOUR-USERNAME/quis.git
cd quis
git remote add upstream https://github.com/videlais/quis.git
```

## Development Setup

### Prerequisites

- Node.js 20.x or 22.x (use `.nvmrc` file)
- npm (comes with Node.js)

### Installation

```bash
# Install dependencies
npm install

# Verify setup
npm run all
```

This will run linting, type checking, build, and all tests.

## Making Changes

### Branch Naming

Create a descriptive branch name:

- `feature/your-feature-name` for new features
- `fix/bug-description` for bug fixes
- `docs/documentation-update` for documentation changes

```bash
git checkout -b feature/your-feature-name
```

### Commit Messages

Follow conventional commit format:

- `feat: Add new feature`
- `fix: Fix bug in parser`
- `docs: Update README`
- `test: Add tests for evaluator`
- `refactor: Improve tokenizer performance`
- `chore: Update dependencies`

Sign your commits:

```bash
git commit -S -m "feat: Add support for new operator"
```

## Testing

### Running Tests

```bash
# Run all tests with coverage
npm test

# Run only Node.js tests
npm run test:node

# Run only browser tests
npm run test:web

# Run all checks (lint, typecheck, build, test)
npm run all
```

### Writing Tests

- Add tests for all new features
- Maintain or improve code coverage (currently 97%+)
- Place tests in appropriate directories:
  - `test/node/` for Node.js-specific tests
  - `test/web/` for browser-specific tests
- Use descriptive test names

Example:

```javascript
describe('New Feature', () => {
    test('should handle edge case correctly', () => {
        const result = parse('$value > 10', { values: () => 15 });
        expect(result).toBe(true);
    });
});
```

## Coding Standards

### TypeScript

- Write all source code in TypeScript
- Enable strict mode
- Export proper type definitions
- Document complex types

### ESLint

```bash
# Check for linting issues
npm run lint:check

# Auto-fix linting issues
npm run lint
```

### Type Checking

```bash
npm run typecheck
```

### Code Style

- Use 4 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line objects/arrays
- Document public APIs with JSDoc comments

## Submitting Changes

### Before Submitting

1. Ensure all tests pass: `npm test`
2. Ensure code is linted: `npm run lint:check`
3. Ensure types are correct: `npm run typecheck`
4. Build successfully: `npm run build`
5. Update documentation if needed
6. Add/update tests for your changes

### Pull Request Process

1. Update CHANGELOG.md with your changes under `[Unreleased]`
2. Push to your fork
3. Create a Pull Request against `main` branch
4. Fill out the PR template completely
5. Wait for CI checks to pass
6. Respond to code review feedback

### PR Guidelines

- Keep PRs focused on a single feature/fix
- Write clear PR descriptions
- Reference related issues with `Fixes #123` or `Closes #123`
- Keep commits clean and organized
- Ensure CI passes before requesting review

## Project Structure

```
quis/
├── src/              # TypeScript source code
│   ├── ast-types.ts  # AST node type definitions
│   ├── tokenizer.ts  # Lexical analysis
│   ├── parser.ts     # Syntax analysis
│   ├── evaluator.ts  # AST evaluation
│   └── index.ts      # Main entry point
├── test/             # Test files
│   ├── node/         # Node.js tests
│   └── web/          # Browser tests
├── build/            # Compiled output (generated)
└── docs/             # Documentation
```

## Build System

- **TypeScript**: Compiles source to type definitions
- **Webpack**: Bundles for different targets (ESM, CJS, Browser)
- **Jest**: Test runner with coverage
- **ESLint**: Code linting
- **Babel**: Transpilation for tests

## Questions?

Feel free to open an issue for:

- Questions about contributing
- Clarification on guidelines
- Feature discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
