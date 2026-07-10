export interface FeaturedWork {
  name: string;
  title: string;
  summary: string;
  architecture: string[];
}

export const FEATURED_WORK: FeaturedWork[] = [
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
    name: "fabric-apps-react-webapp-starter",
    title: "Fabric Semantic Model Starter",
    summary:
      "A React and TypeScript starter for Microsoft Fabric Apps, using live DAX metadata to turn a Power BI semantic model into an explorable interface.",
    architecture: [
      "React 19 and TypeScript",
      "Microsoft Fabric Apps query bridge",
      "Live DAX semantic-model metadata",
      "Config-driven builds and Rayfin deployment",
    ],
  },
  {
    name: "modelviz",
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

export const CURATED_PROJECT_SUMMARIES: Record<string, string> = {
  portfolio:
    "A living portfolio that turns a broad GitHub history into curated architecture work and an explorable project archive.",
  ...Object.fromEntries(
    FEATURED_WORK.map(project => [project.name, project.summary])
  ),
};
