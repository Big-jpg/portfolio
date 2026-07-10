import { HIGHLIGHTED_REPOS } from "./repo-utils";
import type { RepoSummary } from "./types";

export type RepoTreeAvailability = "live" | "workshop";
export type RepoTreeProvenance = "original" | "fork";

export interface RepoTreeBuildOptions {
  interpretations?: Readonly<Record<string, string | undefined>>;
}

export interface RepoTreeCounts {
  total: number;
  live: number;
  workshop: number;
  original: number;
  fork: number;
}

export interface RepoTreeRepoNode {
  kind: "repo";
  id: string;
  label: string;
  repo: RepoSummary;
}

export interface RepoTreeTerminalNode {
  kind: "bucket";
  id: `${RepoTreeAvailability}-${RepoTreeProvenance}`;
  label: string;
  count: number;
  availability: RepoTreeAvailability;
  provenance: RepoTreeProvenance;
  children: RepoTreeRepoNode[];
}

export interface RepoTreeAvailabilityNode {
  kind: "availability";
  id: RepoTreeAvailability;
  label: string;
  count: number;
  availability: RepoTreeAvailability;
  children: [RepoTreeTerminalNode, RepoTreeTerminalNode];
}

export interface RepoTreeRootNode {
  kind: "root";
  id: "root";
  label: string;
  count: number;
  counts: RepoTreeCounts;
  children: [RepoTreeAvailabilityNode, RepoTreeAvailabilityNode];
}

export type RepoTreeNode =
  | RepoTreeRootNode
  | RepoTreeAvailabilityNode
  | RepoTreeTerminalNode
  | RepoTreeRepoNode;

const REPRESENTATIVE_COUNT = 2;

const TERMINAL_LABELS: Record<RepoTreeProvenance, string> = {
  original: "Original builds",
  fork: "Built on others",
};

/**
 * Builds the fixed semantic discovery tree used by the portfolio hero.
 *
 * Repository identity is case-insensitive by name (falling back to URL), so a
 * duplicate input row cannot inflate counts or appear twice as a leaf.
 */
export function buildRepoTree(
  repos: readonly RepoSummary[],
  options: RepoTreeBuildOptions = {}
): RepoTreeRootNode {
  const uniqueRepos = deduplicateRepos(repos);

  const live = uniqueRepos.filter(isLiveRepo);
  const workshop = uniqueRepos.filter(repo => !isLiveRepo(repo));
  const original = uniqueRepos.filter(repo => !repo.isFork);
  const fork = uniqueRepos.filter(repo => repo.isFork);

  return {
    kind: "root",
    id: "root",
    label: `Explore ${uniqueRepos.length} ${pluralize("project", uniqueRepos.length)}`,
    count: uniqueRepos.length,
    counts: {
      total: uniqueRepos.length,
      live: live.length,
      workshop: workshop.length,
      original: original.length,
      fork: fork.length,
    },
    children: [
      buildAvailabilityNode("live", live, options.interpretations),
      buildAvailabilityNode("workshop", workshop, options.interpretations),
    ],
  };
}

function buildAvailabilityNode(
  availability: RepoTreeAvailability,
  repos: readonly RepoSummary[],
  interpretations: RepoTreeBuildOptions["interpretations"]
): RepoTreeAvailabilityNode {
  const label = availability === "live" ? "Live & usable" : "In the workshop";

  return {
    kind: "availability",
    id: availability,
    label,
    count: repos.length,
    availability,
    children: [
      buildTerminalNode(availability, "original", repos, interpretations),
      buildTerminalNode(availability, "fork", repos, interpretations),
    ],
  };
}

function buildTerminalNode(
  availability: RepoTreeAvailability,
  provenance: RepoTreeProvenance,
  repos: readonly RepoSummary[],
  interpretations: RepoTreeBuildOptions["interpretations"]
): RepoTreeTerminalNode {
  const matchingRepos = repos.filter(repo =>
    provenance === "fork" ? repo.isFork : !repo.isFork
  );

  return {
    kind: "bucket",
    id: `${availability}-${provenance}`,
    label: TERMINAL_LABELS[provenance],
    count: matchingRepos.length,
    availability,
    provenance,
    children: selectRepresentatives(matchingRepos, interpretations).map(
      repo => ({
        kind: "repo",
        id: `repo:${repoIdentity(repo)}`,
        label: repo.name,
        repo,
      })
    ),
  };
}

function selectRepresentatives(
  repos: readonly RepoSummary[],
  interpretations: RepoTreeBuildOptions["interpretations"]
): RepoSummary[] {
  return [...repos]
    .sort((left, right) => compareRepresentatives(left, right, interpretations))
    .slice(0, REPRESENTATIVE_COUNT);
}

function compareRepresentatives(
  left: RepoSummary,
  right: RepoSummary,
  interpretations: RepoTreeBuildOptions["interpretations"]
): number {
  const highlightedDifference =
    Number(HIGHLIGHTED_REPOS.has(right.name)) -
    Number(HIGHLIGHTED_REPOS.has(left.name));
  if (highlightedDifference !== 0) return highlightedDifference;

  const copyDifference =
    Number(hasMeaningfulCopy(right, interpretations)) -
    Number(hasMeaningfulCopy(left, interpretations));
  if (copyDifference !== 0) return copyDifference;

  const starDifference = safeStars(right) - safeStars(left);
  if (starDifference !== 0) return starDifference;

  const recencyDifference =
    safeTimestamp(right.pushedAt) - safeTimestamp(left.pushedAt);
  if (recencyDifference !== 0) return recencyDifference;

  const nameDifference = left.name.localeCompare(right.name, undefined, {
    sensitivity: "base",
  });
  if (nameDifference !== 0) return nameDifference;

  return left.url.localeCompare(right.url, undefined, { sensitivity: "base" });
}

function hasMeaningfulCopy(
  repo: RepoSummary,
  interpretations: RepoTreeBuildOptions["interpretations"]
): boolean {
  const copy = interpretations?.[repo.name] || repo.description;
  const normalized = copy?.replace(/\s+/g, " ").trim() ?? "";

  if (normalized.length < 12) return false;

  return !/^(?:n\/?a|none|test|todo|no description(?: available)?)[.!]?$/i.test(
    normalized
  );
}

function safeStars(repo: RepoSummary): number {
  return Number.isFinite(repo.stargazerCount)
    ? Math.max(0, repo.stargazerCount)
    : 0;
}

function safeTimestamp(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function isLiveRepo(repo: RepoSummary): boolean {
  return repo.homepageUrl.trim().length > 0;
}

function deduplicateRepos(repos: readonly RepoSummary[]): RepoSummary[] {
  const unique = new Map<string, RepoSummary>();

  repos.forEach((repo, index) => {
    const identity = repoIdentity(repo, index);
    if (!unique.has(identity)) unique.set(identity, repo);
  });

  return Array.from(unique.values());
}

function repoIdentity(repo: RepoSummary, fallbackIndex?: number): string {
  const normalizedName = repo.name.trim().toLocaleLowerCase("en-US");
  if (normalizedName) return normalizedName;

  const normalizedUrl = repo.url.trim().toLocaleLowerCase("en-US");
  if (normalizedUrl) return normalizedUrl;

  return `unnamed-${fallbackIndex ?? 0}`;
}

function pluralize(noun: string, count: number): string {
  return count === 1 ? noun : `${noun}s`;
}
