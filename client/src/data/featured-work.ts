export interface FeaturedWork {
  name: string;
  number: string;
  signal: string;
  title: string;
  summary: string;
  architecture: string[];
}

export const FEATURED_WORK: FeaturedWork[] = [
  {
    name: "github-motion-graph",
    number: "01",
    signal: "Vercel-native application architecture",
    title: "GitHub Motion Graph",
    summary:
      "A force-directed view of repository, commit, branch, and pull-request activity, designed as a modern full-stack application rather than a static visualisation.",
    architecture: [
      "Next.js 16 and React Server Components",
      "Edge and Node API routes",
      "Neon Postgres and Drizzle ORM",
      "Vercel deployment and analytics",
    ],
  },
  {
    name: "invoicepipe",
    number: "02",
    signal: "Secure AI-assisted workflow",
    title: "InvoicePipe",
    summary:
      "A tenant-isolated invoice-processing platform that joins a responsive web experience to Azure AI extraction and a production-conscious service boundary.",
    architecture: [
      "Next.js application and typed APIs",
      "Azure AI extraction pipeline",
      "Containerised Python service",
      "Validation, correlation IDs, and structured logging",
    ],
  },
  {
    name: "modelviz",
    number: "03",
    signal: "Privacy-conscious enterprise tooling",
    title: "ModelViz",
    summary:
      "A browser-based architecture tool for inspecting Power BI and Microsoft Fabric semantic models, including relationships, data-source modes, and row-level security.",
    architecture: [
      "Next.js and TypeScript",
      "Deterministic local TMDL parsing",
      "Interactive architecture diagrams",
      "Security and data-source inspection",
    ],
  },
];

export const FEATURED_WORK_NAMES = new Set(
  FEATURED_WORK.map(project => project.name)
);

export const CURATED_PROJECT_SUMMARIES: Record<string, string> = {
  portfolio:
    "A living portfolio that turns a broad GitHub history into curated architecture work and an explorable project archive.",
  ...Object.fromEntries(
    FEATURED_WORK.map(project => [project.name, project.summary])
  ),
};
