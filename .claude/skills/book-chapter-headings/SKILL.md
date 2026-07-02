---
name: book-chapter-headings
description: Use whenever creating or editing a book chapter markdown file under src/data/books/**/*.md (e.g. adding a new chapter, splitting/rewriting an existing one, or importing WFRP source text). Ensures the chapter's sidebar/bottom-sheet table of contents renders consistently, the way it does on the Bestiary chapter.
---

# Book chapter heading levels

The chapter reader (`src/components/books/BooksLibrary.tsx`) only builds a
table of contents from `##` (H2) headings — see
`src/components/books/ChapterTableOfContents.tsx` and
`src/components/books/headingSlug.ts`. A chapter needs **at least two** H2
headings before the ToC sidebar/bottom sheet appears at all
(`hasToc = headings.filter(h => h.level === 2).length >= 2`).

If a chapter's major sections are written as `###` instead of `##`, the ToC
silently disappears for that chapter while every other chapter still shows
one — which is exactly the "Bestiary looks different from every other
chapter" bug this skill exists to prevent.

## Convention

- `#` — chapter title only, once, at the top of the file.
- `##` — every major, navigable section of the chapter (what a reader should
  be able to jump to from the ToC). Bestiary's `## The People of the
  Reikland`, `## Creature Traits Glossary`, etc. are the reference example.
- `###` — subsections within a `##` section (e.g. individual creature/spell/
  career entries).
- `####`/`#####` — deeper nesting within a `###` subsection, if needed.

Do not start a chapter's body straight at `###` (skipping `##`) — that
orphans the section from the ToC. If a chapter genuinely covers only one
topic with no natural sibling sections (so a ToC wouldn't be useful anyway),
it's fine to have zero or one `##` heading; the reader correctly hides the
ToC in that case.

## Checklist when adding/editing a chapter file

1. Write/keep exactly one `#` at the top.
2. Every top-level section a reader would want to jump to must be `##`.
3. Subsections go one level deeper (`###`), never skipping from `#` to `###`.
4. After editing, sanity-check the levels actually used:
   ```sh
   grep -noE '^#{1,6} .*' src/data/books/<book>/<chapter>.md
   ```
   Compare against `src/data/books/core-rulebook/bestiary.md` if unsure.
5. If the file has CRLF line endings, double-check any scripted edits
   actually applied — a `$`-anchored regex without `\r?` handling will
   silently no-op on CRLF lines (`file <chapter>.md` shows line-ending type).
