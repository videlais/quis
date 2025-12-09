# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.7] - 9 Dec 2025

### Added

- CHANGELOG.md to track version history
- CONTRIBUTING.md with development guidelines
- SECURITY.md with security policy
- CODE_OF_CONDUCT.md for community guidelines
- GitHub issue and PR templates
- .npmignore for package optimization
- .nvmrc for Node.js version specification

## [1.3.6] - 31 Oct 2025

### Security

This is the first of regular maintenance updates.

## [1.3.0] - 9 Oct 2025

### Added

Added TypeScript and exported types.

There is now a demo: https://videlais.github.io/quis/

## [1.2.0] - 1 Oct 2025

### Added

Updated Quis to support complex boolean expressions like `($user.health > 30 && $user.magic > 10) || $inventory.potion == true`.

## [1.1.0] - 30 Sept 2025

### Added

New major changes for this version is the addition of key-value access. For example, dot-notation format, `$user.name` now works and properties of objects can also be accessed via brackets such as `$user[name]`.

## [1.0.1] - 3 Jan 2024

### Added

- Shift from Common JS to ES6.
- Shift to ESBuild from WebPack.

---

## Release Categories

### Added

For new features.

### Changed

For changes in existing functionality.

### Deprecated

For soon-to-be removed features.

### Removed

For now removed features.

### Fixed

For any bug fixes.

### Security

In case of vulnerabilities.
