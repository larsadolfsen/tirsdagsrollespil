export type ChapterMeta = {
  id: string;
  title: string;
};

export type BookMeta = {
  id: string;
  title: string;
  chapters: ChapterMeta[];
};
