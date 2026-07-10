// client/src/lib/repo-utils.ts

import type { Filters, RepoSummary } from "./types";

// GitHub-canonical language colors
export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#86B6D9",
  Python: "#93BEA4",
  JavaScript: "#E5C866",
  "C++": "#D9A1B0",
  "C#": "#9FC493",
  CSS: "#B4A5D6",
  HTML: "#DFA28E",
  "Jupyter Notebook": "#D8AA82",
  PowerShell: "#8FAEC8",
};

// Highlighted repos (have live deployments and are most impressive)
export const HIGHLIGHTED_REPOS = new Set([
  "modelviz",
  "print-portfolio",
  "invoicepipe",
  "ftl",
  "convergent",
  "closegate",
  "next-boids-text",
  "orbitme",
  "videoretarder",
  "fuelwatch_signal",
  "conformal-stencil-generator",
  "pixeltovoxel-demo",
]);

export function getLanguages(repos: RepoSummary[]): string[] {
  const langSet = new Set<string>();
  repos.forEach(r => {
    if (r.primaryLanguage?.name) {
      langSet.add(r.primaryLanguage.name);
    }
  });
  return Array.from(langSet).sort();
}

export function filterRepos(
  repos: RepoSummary[],
  filters: Filters
): RepoSummary[] {
  return repos.filter(repo => {
    // Language filter
    if (filters.language !== "All") {
      const lang = repo.primaryLanguage?.name || "";
      if (lang !== filters.language) return false;
    }

    if (filters.availability === "Live" && !repo.homepageUrl) return false;
    if (filters.availability === "Workshop" && repo.homepageUrl) return false;

    if (filters.provenance === "Original" && repo.isFork) return false;
    if (filters.provenance === "Fork" && !repo.isFork) return false;

    return true;
  });
}

export function sortByPushedAt<T extends RepoSummary>(repos: T[]): T[] {
  return [...repos].sort(
    (a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()
  );
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function slugify(name: string): string {
  return encodeURIComponent(name);
}
