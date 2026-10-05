# GitHub Copilot Instructions for MiniSpeckit

This repository uses **MiniSpeckit** for Spec-Driven Development (SDD).

- Feature specifications live in `specs/NNN-feature-name.md`.
- Each spec contains:
  1. **Specification** (User Story & Acceptance Criteria)
  2. **Technical Plan** (Files to touch & Architecture)
  3. **Tasks Checklist** (Checkable `[ ]` items)
  4. **Verification** (Commands and manual steps)

When asked to implement a feature:
1. Locate its spec in `specs/`.
2. Follow the architectural plan and files to touch.
3. Implement tasks sequentially and update `- [ ]` to `- [x]`.
4. Run project tests to ensure quality.
