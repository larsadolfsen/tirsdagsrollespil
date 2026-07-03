---
name: new-project-setup
description: Use when starting a new project or when a project is missing foundational skills. Creates the standard skill set every project needs as a framework before any feature work begins.
---

# New project setup — skill framework

Every project needs the following skills created before feature work begins. They prevent recurring problems like recreating existing components, violating code patterns, or inconsistent git workflows.

## Standard skill checklist

Create one skill file per category. Each skill must be filled in with project-specific details — generic placeholders are not useful.

### 1. `ui-components` skill
**Purpose:** Stop recreating components that already exist.
**Must include:**
- A table of every reusable UI component: name, location, variants/props, when to use
- What NOT to use (raw HTML tags, hardcoded colors, etc.)
- How to find components: directory to scan, naming conventions

**Trigger:** Invoke before writing any UI element, button, card, input, or layout.

---

### 2. `code-patterns` skill
**Purpose:** Enforce project conventions before writing any code.
**Must include:**
- File and folder naming conventions
- Explicit list of forbidden patterns (raw tags, hardcoded values, etc.)
- How new files should be structured
- Where different types of logic live (components vs hooks vs utils vs context)

**Trigger:** Invoke at the start of any implementation task.

---

### 3. `git-workflow` skill
**Purpose:** Consistent branching, committing, and PR process.
**Must include:**
- Branch naming convention
- Commit message format
- Pre-push checklist (lint, build, test)
- PR size rules and draft PR usage
- Merge strategy (merge vs rebase)

**Trigger:** Invoke before starting any task that involves code changes.

---

### 4. `testing-approach` skill
**Purpose:** Know what to test and how before writing tests.
**Must include:**
- Test framework and where tests live
- What types of things need tests (features, bugfixes, edge cases)
- How to run tests locally
- Patterns to follow (e.g. page object model, test data conventions)

**Trigger:** Invoke before writing any test or before submitting a PR.

---

### 5. `data-and-api` skill
**Purpose:** Understand data flow before touching state or API calls.
**Must include:**
- How state is managed (context, hooks, store)
- How the frontend calls the backend (fetch patterns, endpoints)
- Data model conventions (types, naming, where models live)
- Any constraints (e.g. runtime data never committed to git)

**Trigger:** Invoke before adding state, API calls, or new data models.

---

## How to apply this skill

1. For each category above, check if a skill already exists in `.claude/skills/`
2. For missing skills: read the relevant source files, then write a concrete skill file
3. For existing skills: verify they are up to date with current project state
4. Add each skill to `.claude/skills/<skill-name>/SKILL.md`
5. Skills are automatically picked up — no registration needed

## PR scope rule

Watch for scope creep during any task. If a branch is touching more than one of these categories in unrelated ways, flag it to the user and suggest splitting into separate PRs.
