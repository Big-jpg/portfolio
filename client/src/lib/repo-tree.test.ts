import { describe, expect, it } from "vitest";
import { buildRepoTree, type RepoTreeTerminalNode } from "./repo-tree";
import type { RepoSummary } from "./types";

function makeRepo(
  name: string,
  overrides: Partial<RepoSummary> = {}
): RepoSummary {
  return {
    name,
    description: "A meaningful repository description",
    homepageUrl: "",
    isArchived: false,
    isFork: false,
    isPrivate: false,
    primaryLanguage: { name: "TypeScript" },
    pushedAt: "2026-01-01T00:00:00Z",
    stargazerCount: 0,
    url: `https://github.com/Big-jpg/${name}`,
    ...overrides,
  };
}

function terminal(
  tree: ReturnType<typeof buildRepoTree>,
  id: RepoTreeTerminalNode["id"]
): RepoTreeTerminalNode {
  const node = tree.children
    .flatMap(branch => branch.children)
    .find(item => item.id === id);
  if (!node) throw new Error(`Missing terminal bucket: ${id}`);
  return node;
}

describe("buildRepoTree", () => {
  it("builds the fixed live/workshop and original/fork hierarchy with counts", () => {
    const tree = buildRepoTree([
      makeRepo("live-original-a", { homepageUrl: "https://a.example" }),
      makeRepo("live-original-b", { homepageUrl: "https://b.example" }),
      makeRepo("live-fork", {
        homepageUrl: "https://fork.example",
        isFork: true,
      }),
      makeRepo("workshop-original"),
      makeRepo("workshop-fork-a", { isFork: true }),
      makeRepo("workshop-fork-b", { isFork: true }),
    ]);

    expect(tree.counts).toEqual({
      total: 6,
      live: 3,
      workshop: 3,
      original: 3,
      fork: 3,
    });
    expect(tree.children.map(({ id, count }) => [id, count])).toEqual([
      ["live", 3],
      ["workshop", 3],
    ]);
    expect(tree.children.every(branch => branch.children.length === 2)).toBe(
      true
    );
    expect(terminal(tree, "live-original").count).toBe(2);
    expect(terminal(tree, "live-fork").count).toBe(1);
    expect(terminal(tree, "workshop-original").count).toBe(1);
    expect(terminal(tree, "workshop-fork").count).toBe(2);
  });

  it("selects two representatives using the documented ranking order", () => {
    const tree = buildRepoTree(
      [
        makeRepo("modelviz", {
          description: "",
          pushedAt: "2020-01-01T00:00:00Z",
        }),
        makeRepo("no-copy-many-stars", {
          description: "test",
          stargazerCount: 999,
          pushedAt: "2026-04-01T00:00:00Z",
        }),
        makeRepo("meaningful-from-interpretation", {
          description: "",
          stargazerCount: 4,
          pushedAt: "2024-01-01T00:00:00Z",
        }),
        makeRepo("meaningful-description", {
          stargazerCount: 3,
          pushedAt: "2026-05-01T00:00:00Z",
        }),
      ],
      {
        interpretations: {
          "meaningful-from-interpretation":
            "A useful interpretation that gives this repository meaningful copy.",
        },
      }
    );

    expect(
      terminal(tree, "workshop-original").children.map(child => child.repo.name)
    ).toEqual(["modelviz", "meaningful-from-interpretation"]);
  });

  it("uses stars, recency, then name as deterministic tie-breakers", () => {
    const tree = buildRepoTree([
      makeRepo("high-stars-old", {
        stargazerCount: 3,
        pushedAt: "2020-01-01T00:00:00Z",
      }),
      makeRepo("zulu", {
        stargazerCount: 2,
        pushedAt: "2026-05-01T00:00:00Z",
      }),
      makeRepo("alpha", {
        stargazerCount: 2,
        pushedAt: "2026-05-01T00:00:00Z",
      }),
      makeRepo("newer-but-fewer-stars", {
        stargazerCount: 1,
        pushedAt: "2027-01-01T00:00:00Z",
      }),
    ]);

    expect(
      terminal(tree, "workshop-original").children.map(child => child.repo.name)
    ).toEqual(["high-stars-old", "alpha"]);
  });

  it("keeps empty buckets, handles sparse input, and removes duplicate identities", () => {
    const empty = buildRepoTree([]);
    expect(empty.count).toBe(0);
    expect(empty.label).toBe("Explore 0 projects");
    expect(empty.children.flatMap(branch => branch.children)).toHaveLength(4);
    expect(
      empty.children
        .flatMap(branch => branch.children)
        .every(bucket => bucket.children.length === 0)
    ).toBe(true);

    const sparse = buildRepoTree([
      makeRepo("Only-One", {
        homepageUrl: "https://one.example",
        pushedAt: "not-a-date",
        stargazerCount: Number.NaN,
      }),
      makeRepo("only-one", {
        homepageUrl: "https://duplicate.example",
      }),
    ]);

    expect(sparse.count).toBe(1);
    expect(sparse.label).toBe("Explore 1 project");
    expect(terminal(sparse, "live-original").children).toHaveLength(1);
    expect(
      new Set(terminal(sparse, "live-original").children.map(child => child.id))
        .size
    ).toBe(1);
  });
});
