import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const USER_LOGIN = process.env.GITHUB_LOGIN || "Big-jpg";
const OUTPUT_PATH = path.resolve("client", "src", "data", "repos.json");
const README_MAX_CHARS = Number(process.env.README_MAX_CHARS || 20000);
const OPTIONAL_TOKEN = process.argv.includes("--if-token");

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type RepoNode = {
  description: string | null;
  homepageUrl: string | null;
  isArchived: boolean;
  isFork: boolean;
  isPrivate: boolean;
  name: string;
  nameWithOwner: string;
  owner: { login: string };
  primaryLanguage: { name: string } | null;
  pushedAt: string | null;
  updatedAt: string;
  stargazerCount: number;
  url: string;
  readmeMd: { text: string } | null;
  readmeMarkdown: { text: string } | null;
  readmeMD: { text: string } | null;
  readmeTxt: { text: string } | null;
};

type Repo = {
  description: string;
  homepageUrl: string;
  isArchived: boolean;
  isFork: boolean;
  isPrivate: boolean;
  name: string;
  nameWithOwner: string;
  ownerLogin: string;
  primaryLanguage: { name: string } | null;
  pushedAt: string;
  stargazerCount: number;
  url: string;
  readme: string;
};

type ReposQueryResult = {
  user: {
    repositories: {
      totalCount: number;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
      nodes: RepoNode[];
    };
  } | null;
  rateLimit: {
    remaining: number;
  };
};

const REPOS_QUERY = `
  query Repos($login: String!, $cursor: String) {
    user(login: $login) {
      repositories(
        first: 100
        after: $cursor
        ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]
        privacy: PUBLIC
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          description
          homepageUrl
          isArchived
          isFork
          isPrivate
          name
          nameWithOwner
          owner {
            login
          }
          primaryLanguage {
            name
          }
          pushedAt
          updatedAt
          stargazerCount
          url
          readmeMd: object(expression: "HEAD:README.md") {
            ... on Blob {
              text
            }
          }
          readmeMarkdown: object(expression: "HEAD:README.markdown") {
            ... on Blob {
              text
            }
          }
          readmeMD: object(expression: "HEAD:README.MD") {
            ... on Blob {
              text
            }
          }
          readmeTxt: object(expression: "HEAD:README.txt") {
            ... on Blob {
              text
            }
          }
        }
      }
    }
    rateLimit {
      remaining
    }
  }
`;

function loadLocalEnv() {
  const envPath = path.resolve(".env.local");
  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function getToken() {
  const envToken =
    process.env.GH_TOKEN || process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
  if (envToken) {
    return envToken;
  }

  try {
    return execFileSync("gh", ["auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

async function githubGraphQL<T>(
  token: string,
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "portfolio-build-script",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  const json = (await response.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(
      `GitHub GraphQL errors: ${json.errors.map(error => error.message).join(", ")}`
    );
  }
  if (!json.data) {
    throw new Error("GitHub GraphQL response did not include data");
  }

  return json.data;
}

function readmeFrom(repo: RepoNode) {
  const text =
    repo.readmeMd?.text ||
    repo.readmeMarkdown?.text ||
    repo.readmeMD?.text ||
    repo.readmeTxt?.text ||
    "";
  if (README_MAX_CHARS > 0 && text.length > README_MAX_CHARS) {
    return `${text.slice(0, README_MAX_CHARS).trimEnd()}\n\n[README truncated for portfolio build.]`;
  }
  return text;
}

function normalizeRepo(repo: RepoNode): Repo {
  return {
    description: repo.description || "",
    homepageUrl: repo.homepageUrl || "",
    isArchived: repo.isArchived,
    isFork: repo.isFork,
    isPrivate: repo.isPrivate,
    name: repo.name,
    nameWithOwner: repo.nameWithOwner,
    ownerLogin: repo.owner.login,
    primaryLanguage: repo.primaryLanguage,
    pushedAt: repo.pushedAt || repo.updatedAt,
    stargazerCount: repo.stargazerCount,
    url: repo.url,
    readme: readmeFrom(repo),
  };
}

async function fetchRepos(token: string) {
  const repos: Repo[] = [];
  let cursor: string | null = null;
  let totalCount: number | null = null;

  do {
    const data: ReposQueryResult = await githubGraphQL(token, REPOS_QUERY, {
      login: USER_LOGIN,
      cursor,
    });

    if (!data.user) {
      throw new Error(`GitHub user not found: ${USER_LOGIN}`);
    }

    const connection = data.user.repositories;
    totalCount = connection.totalCount;
    repos.push(...connection.nodes.map(normalizeRepo));
    cursor = connection.pageInfo.hasNextPage
      ? connection.pageInfo.endCursor
      : null;

    console.log(
      `Fetched ${repos.length}/${totalCount} affiliated public repos. Rate limit remaining: ${data.rateLimit.remaining}.`
    );
  } while (cursor);

  return repos.sort(
    (a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()
  );
}

async function main() {
  loadLocalEnv();

  const token = getToken();
  if (!token) {
    const message =
      "No GH_TOKEN, GITHUB_TOKEN, GITHUB_PAT, or GitHub CLI token found; using existing checked-in repo data.";
    if (OPTIONAL_TOKEN) {
      console.log(message);
      return;
    }
    throw new Error(message);
  }

  const repos = await fetchRepos(token);
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(repos, null, 2)}\n`, "utf8");

  const forkCount = repos.filter(repo => repo.isFork).length;
  console.log(
    `Wrote ${repos.length} affiliated public repos to ${OUTPUT_PATH} (${forkCount} forks).`
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
