// client/src/lib/types.ts

export interface RepoSummary {
  name: string;
  nameWithOwner?: string;
  ownerLogin?: string;
  description: string;
  homepageUrl: string;
  isArchived: boolean;
  isFork: boolean;
  isPrivate: boolean;
  primaryLanguage: { name: string } | null;
  pushedAt: string;
  stargazerCount: number;
  url: string;
}

export interface Repo extends RepoSummary {
  readme: string;
}

export type FilterLanguage = "All" | string;
export type FilterAvailability = "All" | "Live" | "Workshop";
export type FilterProvenance = "All" | "Original" | "Fork";

export interface Filters {
  language: FilterLanguage;
  availability: FilterAvailability;
  provenance: FilterProvenance;
}
