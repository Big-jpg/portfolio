// client/src/lib/types.ts

export interface Repo {
  name: string;
  description: string;
  homepageUrl: string;
  isArchived: boolean;
  isFork: boolean;
  isPrivate: boolean;
  primaryLanguage: { name: string } | null;
  pushedAt: string;
  stargazerCount: number;
  url: string;
  readme: string;
}

export type FilterLanguage = "All" | string;
export type FilterType = "All" | "Deployed" | "Private" | "Fork" | "Original";

export interface Filters {
  language: FilterLanguage;
  type: FilterType;
}
