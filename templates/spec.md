# Spec {{ID}}: {{TITLE}}

**Status**: Draft  
**Author**: User  
**Created**: {{DATE}}  
**Target Milestone / Branch**: `feature/{{SLUG}}`

---

## 1. Specification (What & Why)

### Context & Problem Statement
*Describe the user problem or business requirement. Why is this feature needed?*

### User Story
As a `[user role]`,  
I want to `[action or capability]`,  
So that `[benefit or outcome]`.

### Acceptance Criteria
- [ ] Criterion 1: *Clear, unambiguous condition for completion*
- [ ] Criterion 2: *Input validation and error handling behavior*
- [ ] Criterion 3: *Performance / edge-case criteria*

### Out of Scope (Non-Goals)
- *Things that will NOT be tackled in this spec to keep PR focused.*

---

## 2. Technical Plan (How)

### Architecture & Approach
*Describe the technical solution, component structure, data flow, and key design decisions.*

### Files to Touch
- **Create**:
  - `path/to/new/file.ts` - *Purpose of the new file*
- **Modify**:
  - `path/to/existing/file.ts` - *Changes needed*

### Dependencies & Third-Party Services
- *Any new libraries, APIs, or environment variables needed (or specify "None")*

### Edge Cases & Failure Modes
- *Edge Case 1: Empty input / null state*
- *Edge Case 2: Network timeout / API failure*
- *Edge Case 3: Rate limiting / concurrency*

---

## 3. Implementation Tasks (Checklist)

> *AI agents: complete tasks sequentially and mark completed items with `[x]`.*

- [ ] **Task 1: Setup & Data Contracts**
  - [ ] Define types / interfaces / schemas
  - [ ] Configure environment variables if applicable
- [ ] **Task 2: Core Logic & Services**
  - [ ] Implement business logic / calculation / API client
  - [ ] Add unit tests covering core operations and edge cases
- [ ] **Task 3: UI & Integration**
  - [ ] Build user-facing components / connect endpoints
  - [ ] Wire error and loading states
- [ ] **Task 4: Quality & Verification**
  - [ ] Run test suite (`npm test` or equivalent) with 100% pass rate
  - [ ] Perform manual smoke test against Acceptance Criteria

---

## 4. Verification & Testing

### Automated Test Command
```bash
npm test
```

### Manual Verification Steps
1. Navigate to `...`
2. Perform action `...`
3. Verify output matches expected result `...`
