import { expect, test } from "@playwright/test";
import { bookCatalog } from "../src/data/books/catalog";

test("book catalog has at least one book, and every book has chapters", () => {
  expect(bookCatalog.length).toBeGreaterThan(0);

  for (const book of bookCatalog) {
    expect(book.chapters.length).toBeGreaterThan(0);
  }
});

test("book ids are unique", () => {
  const ids = bookCatalog.map((book) => book.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test("chapter ids are unique within each book", () => {
  for (const book of bookCatalog) {
    const chapterIds = book.chapters.map((chapter) => chapter.id);
    expect(new Set(chapterIds).size, `duplicate chapter id in ${book.id}`).toBe(chapterIds.length);
  }
});

test("the core rulebook's first chapter is Throwing Bones", () => {
  const coreRulebook = bookCatalog.find((book) => book.id === "core-rulebook");
  expect(coreRulebook?.chapters[0]).toEqual({ id: "throwing-bones", title: "Throwing Bones" });
});
