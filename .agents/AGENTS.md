# AGENTS.md — Fundsroom Project Agent Instructions

> This file governs how every AI agent (Antigravity, Amp, Cursor, Copilot, etc.) behaves inside this workspace.
> Rules here are always active. Read this file completely before executing any task.

---

## 1. Project Overview

**Fundsroom** is a full-stack SaaS application. The design language is documented in [`DESIGN.md`](../DESIGN.md) — a Clay-inspired claymation design system built on a cream-canvas aesthetic with saturated brand-color feature cards.

**Always read `DESIGN.md` before touching any UI or styling work.**

---

## 2. Available Skills — When & How to Use Them

Three skills are installed in `.agents/skills/`. You MUST use them proactively — do not rely on general knowledge when a skill covers the task.

### 2.1 `ui-ux-pro-max`
**Path:** `.agents/skills/ui-ux-pro-max/SKILL.md`

**Trigger this skill when:**
- Designing or building any new page, layout, or component
- Choosing color palettes, typography, spacing, or animation
- Reviewing UI for accessibility, consistency, or quality
- Implementing navigation, responsive behavior, or data visualization
- Any task that changes how something **looks, feels, moves, or is interacted with**

**How to use:**
1. Read `.agents/skills/ui-ux-pro-max/SKILL.md` first.
2. Run the search script (`scripts/search.py`) with `--design-system` for new pages.
3. Use `--domain` flags (`ux`, `color`, `typography`, `gsap`, `chart`, etc.) for targeted lookups.
4. Always match the detected stack (check `package.json` to detect React/Next.js/Vue/etc.).
5. Persist the design system with `--persist --output-dir <project-root>` so decisions survive across sessions.

**Priority order to check:** Accessibility → Touch/Interaction → Performance → Style → Layout → Typography/Color → Animation → Forms → Navigation → Charts.

---

### 2.2 `design-system`
**Path:** `.agents/skills/design-system/SKILL.md`

**Trigger this skill when:**
- Auditing components for naming inconsistencies or hardcoded values
- Writing documentation for a component's variants, states, or accessibility notes
- Designing a new pattern that must fit the existing system
- Someone asks "is this token correct?" or "does this match the design system?"

**How to use:**
```
/design-system audit                    # Full system audit
/design-system document [component]     # Document a component
/design-system extend [pattern]         # Design a new pattern
```

**Critical rule:** Never inline hex values. Always reference `DESIGN.md` tokens using `{colors.*}`, `{typography.*}`, `{spacing.*}`, `{rounded.*}`. A token reference violation is a blocking issue.

---

### 2.3 `improve-codebase-architecture`
**Path:** `.agents/skills/improve-codebase-architecture/SKILL.md`

**Trigger this skill when:**
- Asked to refactor, restructure, or clean up the codebase
- Identifying architectural friction points or hot-spot modules
- Reviewing module depth, testability, or seam clarity
- The user asks "how can we improve this?" at a systems level

**How to use:**
1. Read `.agents/skills/improve-codebase-architecture/SKILL.md` first.
2. Check `git log --oneline` to find hot spots before exploring broadly.
3. Generate an HTML architecture report to the OS temp dir.
4. Use the vocabulary: **module**, **interface**, **depth**, **seam**, **adapter**, **leverage**, **locality** — never drift into "service", "API", "boundary", or "component".

---

## 3. Design System Rules (Always Active)

These rules are derived from `DESIGN.md` and are non-negotiable for all UI work.

### 3.1 Token Usage
| What | Rule |
|------|------|
| Colors | Only use `{colors.*}` tokens. Never hardcode hex. |
| Typography | Use `{typography.*}` scale. Plain Black (or Inter 500) for display, Inter for body/UI. |
| Spacing | Use `{spacing.*}` tokens. Base unit = 4px. |
| Border radius | Use `{rounded.*}` tokens. `md`(12px) buttons, `lg`(16px) content, `xl`(24px) feature cards. |
| Shadows | No heavy shadows. Depth comes from color contrast, not elevation. |

### 3.2 Visual Identity
- **Canvas:** Always cream (`{colors.canvas}` — #fffaf0). Never cool gray.
- **Feature cards:** Cycle pink → teal → lavender → peach → ochre → cream. Never repeat the same color twice in a row.
- **Display headlines:** Plain Black 500 with negative letter-spacing. Never bolder than 500.
- **Footer:** Always cream-tinted (`{colors.surface-soft}`). Never dark.
- **Hero illustrations:** 3D claymation assets. Never replace with flat vector art.

### 3.3 Responsive Breakpoints
| Name | Width | Key Behavior |
|------|-------|--------------|
| Mobile | < 768px | Hamburger nav, 1-up grids, hero stacks |
| Tablet | 768–1024px | 2-up cards, tighter nav |
| Desktop | 1024–1440px | Full nav, 3-up feature cards |
| Wide | > 1440px | Max content width 1280px |

---

## 4. Full-Stack Development Standards

These apply to every file in the project, regardless of task.

### 4.1 Frontend
- **Framework detection:** Check `package.json` before assuming stack. Never assume.
- **Styling:** Vanilla CSS with design tokens by default. Use Tailwind only if explicitly requested — confirm version first.
- **State management:** Use the framework's built-in state before reaching for external stores. Justify external stores in a comment.
- **Components:** Single responsibility. One concern per file. Name by what it renders, not what it does.
- **Images:** Use WebP/AVIF. Always define `width` + `height` to prevent CLS. Use lazy loading for below-fold images.
- **Fonts:** Load from Google Fonts or local. Never use system font stack for display headings.
- **Animations:** Duration 150–300ms. Always include `prefers-reduced-motion` media query.
- **Accessibility:** Min contrast 4.5:1. All interactive elements need `aria-label` or visible text. Min touch target 44×44px. No focus ring removal.
- **SEO:** Every page needs a unique `<title>`, `<meta name="description">`, one `<h1>`, and semantic HTML5 elements.

### 4.2 Backend
- **API design:** RESTful by default. Use consistent URL naming: `GET /resources`, `POST /resources`, `GET /resources/:id`, `PATCH /resources/:id`, `DELETE /resources/:id`.
- **HTTP status codes:** Use correctly — `200` OK, `201` Created, `204` No Content, `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `422` Validation Error, `500` Server Error.
- **Request validation:** Validate all inputs at the boundary. Never trust client data.
- **Error responses:** Always return structured JSON: `{ "error": { "code": "...", "message": "..." } }`.
- **Logging:** Log at entry and exit of all API endpoints. Include request ID in every log line.
- **Environment variables:** Never hardcode secrets, credentials, or environment-specific config. Use `.env` files. Document all required variables in `.env.example`.
- **Async/await:** Prefer async/await over callbacks or raw promises. Always handle rejections.
- **Rate limiting:** Apply rate limiting on all public endpoints.

### 4.3 Database
- **Migrations:** All schema changes go through migration files. Never mutate the DB schema directly.
- **Queries:** Use parameterized queries or an ORM. Never concatenate user input into SQL strings.
- **Indexes:** Add indexes for all foreign keys and frequently-queried columns.
- **Transactions:** Wrap multi-step mutations in a transaction. Roll back on any failure.
- **Soft deletes:** Prefer `deleted_at` timestamps over hard deletes for auditable entities.
- **Naming conventions:** Tables: `snake_case` plural (e.g., `fund_rooms`). Columns: `snake_case`. Primary key: `id`. Timestamps: `created_at`, `updated_at`.

### 4.4 Authentication & Authorization
- **Auth tokens:** Use short-lived JWT access tokens + long-lived refresh tokens. Store refresh tokens server-side.
- **Password storage:** Bcrypt or Argon2 only. Minimum 12 rounds. Never MD5/SHA1.
- **Authorization:** Check permissions at the route/handler level, not just the UI. Fail closed (deny by default).
- **CSRF:** Enable CSRF protection on all state-mutating endpoints for browser clients.
- **Session secrets:** Rotate on deploy. Source from environment variables.

### 4.5 Security
- **OWASP Top 10:** Keep the OWASP Top 10 in mind at all times. Sanitize output, validate input, use parameterized queries, and limit permissions.
- **Headers:** Set `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security` on all responses.
- **CORS:** Configure CORS explicitly. Never use wildcard (`*`) in production.
- **Dependencies:** Do not add new packages without checking for known vulnerabilities (`npm audit`, `pip-audit`, etc.).
- **Sensitive data:** Never log passwords, tokens, credit card numbers, or PII.

### 4.6 Performance
- **Frontend:** Lazy-load routes and heavy components. Tree-shake dead code. Inline critical CSS.
- **API:** Cache expensive reads (Redis or in-memory). Paginate list endpoints — never return unbounded arrays.
- **Database:** Explain slow queries. N+1 queries are a blocking issue.
- **Monitoring:** All API endpoints should emit latency and error-rate metrics.
- **Bundle size:** Keep initial JS bundle < 200 KB gzipped for marketing/landing pages.

### 4.7 Testing
- **Unit tests:** All pure functions and utilities must have unit tests.
- **Integration tests:** All API endpoints need at least a happy-path integration test.
- **Accessibility tests:** Run axe-core or equivalent against every new page.
- **Test naming:** `it("should [expected behavior] when [condition]")`.
- **Coverage:** Aim for >= 80% coverage on business logic. Do not count test files toward coverage.
- **No flaky tests:** Tests must be deterministic. Mock time, network, and filesystem.

### 4.8 Code Quality
- **Linting:** Fix all linting errors before committing. Zero warnings policy on new code.
- **Formatting:** Use the project's formatter (Prettier/ESLint). Never reformat entire files for unrelated changes.
- **Comments:** Comment the *why*, not the *what*. Self-documenting code is the goal.
- **Magic numbers:** No magic numbers. Extract to named constants with units in the name (e.g., `SESSION_TIMEOUT_MS`).
- **Dead code:** Delete unused code immediately. Do not comment it out and leave it.
- **File size:** Keep files under 400 lines. Split at natural seams when exceeded.
- **Naming:** Use intention-revealing names. Abbreviations only when universally understood (e.g., `id`, `url`, `db`).

### 4.9 Git & CI/CD
- **Branch naming:** `feature/`, `fix/`, `chore/`, `docs/` prefixes.
- **Commit messages:** Conventional Commits format: `feat: add fund search filter`, `fix: correct pagination offset`.
- **PRs:** Each PR should do one thing. Link to the issue it resolves.
- **CI checks:** All PRs must pass linting, tests, and type-checking before merge.
- **Secrets in CI:** Use environment secrets, never hardcode in workflow files.
- **Build verification:** Always run `npm run build` (or equivalent) to verify no build errors before marking work as done.

---

## 5. Agent Efficiency Rules

These rules make agent interactions faster and more reliable.

### 5.1 Before Starting Any Task
1. **Check KI summaries** in the knowledge system for existing patterns relevant to the task.
2. **Read `DESIGN.md`** before any UI/styling work.
3. **Read the relevant skill** before any design, architecture, or UI task.
4. **Check `package.json`** (or equivalent) to detect the exact stack — never assume.
5. **Read existing code** in the affected area before writing new code.

### 5.2 Planning
- Create an `implementation_plan.md` artifact for any task requiring > 3 file changes or architectural decisions.
- Flag open questions in the plan rather than making silent assumptions.
- Wait for user approval on plans before executing.

### 5.3 During Execution
- Mark tasks complete in `task.md` as you go.
- Prefer small, incremental changes over large rewrites.
- Run the build/lint/test suite after each meaningful change to catch issues early.
- Never silently skip a failing test — either fix it or flag it explicitly.

### 5.4 Finishing
- Always verify the build passes.
- Create a `walkthrough.md` artifact summarizing what changed, what was tested, and any follow-up items.
- Embed screenshots or recordings in the walkthrough for UI changes.

### 5.5 Communication
- Be concise. Summarize key decisions, not exhaustive detail.
- Link to specific files and line numbers using `file://` markdown links.
- Ask clarifying questions rather than guessing at ambiguous requirements.
- Recommend `/goal` for long-running overnight tasks.
- Recommend `/learn` after solving a tricky setup so the pattern is remembered.

---

## 6. Project-Specific Conventions

| Area | Convention |
|------|------------|
| Design tokens | Source of truth is `DESIGN.md` frontmatter |
| Component documentation | Use `design-system` skill's document output format |
| Architecture vocabulary | Use `improve-codebase-architecture` skill's terms |
| UI research | Use `ui-ux-pro-max` skill's search script |
| New page design system | Persist to `design-system/<project-slug>/MASTER.md` |

---

## 7. Do's and Don'ts (Quick Reference)

### Do
- Use design tokens from `DESIGN.md` for every CSS value
- Trigger the `ui-ux-pro-max` skill for any visual design task
- Validate all user input at the API boundary
- Write tests for all new business logic
- Use conventional commit messages
- Document environment variables in `.env.example`
- Paginate all list API endpoints
- Use `prefers-reduced-motion` on all animations

### Don't
- Hardcode hex colors, arbitrary spacing, or font sizes
- Skip the relevant skill when designing UI or reviewing architecture
- Store secrets or credentials in source code
- Return unbounded arrays from API endpoints
- Repeat the same brand-color feature card twice in a row
- Use a dark footer (cream only)
- Bold display headlines beyond weight 500
- Leave dead/commented-out code in the codebase
- Suppress linting errors with inline disable comments without a documented reason
