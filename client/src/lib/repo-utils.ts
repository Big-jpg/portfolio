// client/src/lib/repo-utils.ts

import type { Repo, Filters } from "./types";

// GitHub-canonical language colors
export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  Python: "#3572A5",
  JavaScript: "#f1e05a",
  "C++": "#f34b7d",
  "C#": "#178600",
  CSS: "#563d7c",
  "Jupyter Notebook": "#DA5B0B",
  PowerShell: "#012456",
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

export function getLanguages(repos: Repo[]): string[] {
  const langSet = new Set<string>();
  repos.forEach((r) => {
    if (r.primaryLanguage?.name) {
      langSet.add(r.primaryLanguage.name);
    }
  });
  return Array.from(langSet).sort();
}

export function filterRepos(repos: Repo[], filters: Filters): Repo[] {
  return repos.filter((repo) => {
    // Language filter
    if (filters.language !== "All") {
      const lang = repo.primaryLanguage?.name || "";
      if (lang !== filters.language) return false;
    }

    // Type filter
    switch (filters.type) {
      case "Deployed":
        if (!repo.homepageUrl) return false;
        break;
      case "Private":
        if (!repo.isPrivate) return false;
        break;
      case "Fork":
        if (!repo.isFork) return false;
        break;
      case "Original":
        if (repo.isFork) return false;
        break;
      case "All":
      default:
        break;
    }

    return true;
  });
}

export function sortByPushedAt(repos: Repo[]): Repo[] {
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
