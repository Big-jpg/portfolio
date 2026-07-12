export interface FeaturedWork {
  name: string;
  title: string;
  summary: string;
  architecture: string[];
  liveUrl?: string;
}

export const FEATURED_WORK: FeaturedWork[] = [
  {
    name: "real-data-for-all",
    title: "Real Data for All",
    summary:
      "Open, auditable Perth house-sales data, rebuilt from a Fabric medallion pipeline into durable Vercel workflows, canonical Neon records, and MotherDuck analytics.",
    architecture: [
      "Immutable Vercel Blob sources with SHA-256 lineage",
      "Durable, idempotent Vercel Workflow ingestion",
      "Canonical property and sale records in Neon Postgres",
      "MotherDuck OLAP and deterministic report exports",
    ],
    liveUrl: "https://perthhousedata.com",
  },
  {
    name: "github-motion-graph",
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
    title: "InvoicePipe",
    summary:
      "An end-to-end invoice system joining a Next.js application, Azure AI extraction, and automated document routing through clear service boundaries.",
    architecture: [
      "Next.js, Prisma, PostgreSQL, and NextAuth",
      "FastAPI and Azure Content Understanding",
      "Power Automate email-to-pipeline workflow",
      "Validation, correlation IDs, and structured logging",
    ],
  },
];

export const CURATED_PROJECT_SUMMARIES: Record<string, string> = {
  portfolio:
    "A living portfolio that turns a broad GitHub history into curated architecture work and an explorable project archive.",
  ...Object.fromEntries(
    FEATURED_WORK.map(project => [project.name, project.summary])
  ),
};
