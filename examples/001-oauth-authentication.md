# Spec 001: GitHub OAuth Authentication

**Status**: Completed  
**Author**: Alex Developer  
**Created**: 2026-10-01  
**Target Milestone / Branch**: `feature/github-oauth`

---

## 1. Specification (What & Why)

### Context & Problem Statement
Currently users can only sign up via email and password. Friction in account creation leads to drop-offs. Developers prefer signing in with their GitHub accounts in 1 click.

### User Story
As a developer visiting the platform,  
I want to sign in using my GitHub account,  
So that I don't have to create or remember another password.

### Acceptance Criteria
- [x] Criterion 1: A "Continue with GitHub" button appears on `/login` and `/signup`.
- [x] Criterion 2: Clicking the button initiates the standard OAuth 2.0 flow with GitHub.
- [x] Criterion 3: On return, if user exists by email, link GitHub ID; if not, create new account.
- [x] Criterion 4: JWT session cookie is issued on success and redirects user to `/dashboard`.
- [x] Criterion 5: If the user cancels OAuth or an error occurs, redirect to `/login?error=oauth_failed` with a user-friendly error toast.

### Out of Scope (Non-Goals)
- Google or Twitter/X OAuth providers (will be handled in a separate spec).
- Fetching user's private GitHub repositories or organization memberships.

---

## 2. Technical Plan (How)

### Architecture & Approach
We use the standard GitHub OAuth web application flow:
1. Client clicks "Continue with GitHub" -> requests `GET /auth/github` -> redirects to `github.com/login/oauth/authorize`.
2. GitHub redirects to `GET /auth/github/callback?code=...&state=...`.
3. Server exchanges code for GitHub Access Token, fetches user profile (`https://api.github.com/user`).
4. Find or create user in database, issue JWT session token in `HttpOnly` cookie.

### Files to Touch
- **Create**:
  - `src/server/auth/github.ts` - OAuth client & token exchange
  - `src/server/routes/auth-github.ts` - Route handlers for redirect & callback
  - `src/components/auth/GitHubButton.tsx` - Reusable UI button
- **Modify**:
  - `src/server/db/schema.ts` - Add `github_id` column to users table
  - `src/pages/login.tsx` - Add GitHubButton to login form

### Dependencies & Third-Party Services
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env`.
- No heavy third-party auth packages needed; standard fetch handles OAuth token exchange.

### Edge Cases & Failure Modes
- **Email collision**: User already signed up with email. Handled by linking `github_id` to existing account if email matches and verified.
- **Missing public email**: GitHub user has email set to private. Handled by querying `https://api.github.com/user/emails` using the temporary OAuth token.
- **State mismatch / CSRF**: `state` token verified via signed temporary session cookie before token exchange.

---

## 3. Implementation Tasks (Checklist)

- [x] **Task 1: Setup & Database Schema**
  - [x] Add `github_id` nullable unique string column to `users` table
  - [x] Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to environment schema
- [x] **Task 2: Backend OAuth Service & Routes**
  - [x] Implement CSRF state generation and verification
  - [x] Implement code exchange and GitHub user profile fetching
  - [x] Implement account find-or-create logic and JWT issuance
- [x] **Task 3: Frontend Integration**
  - [x] Build `GitHubButton` component with SVG GitHub icon
  - [x] Mount button on `/login` and `/signup` pages
  - [x] Add error toast handler for `?error=oauth_failed`
- [x] **Task 4: Testing & Verification**
  - [x] Write unit tests for state verification and token exchange mock
  - [x] Run `npm test` (all 14 tests passing)
  - [x] Verify live login redirect loop in staging

---

## 4. Verification & Testing

### Automated Test Command
```bash
npm test tests/auth/github.test.ts
```

### Manual Verification
1. Open Incognito window to `http://localhost:3000/login`.
2. Click "Continue with GitHub".
3. Authorize on GitHub.
4. Verify landing on `/dashboard` with valid session cookie.
