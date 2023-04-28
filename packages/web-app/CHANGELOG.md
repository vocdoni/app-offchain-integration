# Changelog

For Aragon App.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.12] - 2023-05-02

### Added

- Search methods to transfers list in Finance
- Dialog to warn when you click button to exit a dialog
- Smart contract composer - store verified contracts (feature still inaccessible)
- By default use ENS name of DAO in urls (falls back to address if no ENS)

### Fixed

- Fixing links to aragon.org docs: /how-to-guides/ changed to /how-to/
- ENS name input for withdrawal address results in gas estimation error
- TODOs and cleanup (low level fixes)
- DAO creation fails when using default of 1 token
- Typo on Create proposal page 'read this guide'
- Finance page empty state text on mobile
- Deposit and Withdraw filters on Finance page transaction list

### Changed

- New deposit flow direct from user's wallet
- Refactor useDaoDetails

### Removed

- useDaoParam hook as part of cache refactoring
