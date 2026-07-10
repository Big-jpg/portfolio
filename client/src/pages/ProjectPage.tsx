import { useMemo } from "react";
import { Link, useParams } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Globe,
  Lock,
  GitFork,
  Calendar,
  Star,
  Sparkles,
  CheckCircle2,
  Circle,
} from "lucide-react";
import repos from "@/data/repos.json";
import interpretations from "@/data/ai-interpretations.json";
import {
  LANGUAGE_COLORS,
  HIGHLIGHTED_REPOS,
  formatDate,
} from "@/lib/repo-utils";
import type { Repo } from "@/lib/types";

const allRepos = repos as Repo[];
const interpMap = interpretations as Record<string, string>;

const tactileLink =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0.5 active:shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25";

export default function ProjectPage() {
  const params = useParams<{ name: string }>();
  const repoName = decodeURIComponent(params.name || "");
  const reduceMotion = useReducedMotion();

  const repo = useMemo(
    () => allRepos.find(candidate => candidate.name === repoName),
    [repoName]
  );

  if (!repo) {
    return (
      <div className="min-h-screen bg-background px-4 py-12 text-foreground flex items-center justify-center">
        <div className="w-full max-w-lg rounded-[2rem] border-2 border-border bg-card p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border-2 border-border bg-primary/10 text-primary">
            <Sparkles className="size-6" aria-hidden="true" />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight">
            Project not found
          </h1>
          <p className="mb-6 text-muted-foreground">
            No repository named &quot;{repoName}&quot; was found.
          </p>
          <Link
            href="/"
            className={`${tactileLink} border-border bg-secondary text-secondary-foreground`}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to portfolio
          </Link>
        </div>
      </div>
    );
  }

  const langColor = repo.primaryLanguage?.name
    ? LANGUAGE_COLORS[repo.primaryLanguage.name] || "#6b7280"
    : "#6b7280";
  const interpretation = interpMap[repo.name];
  const isHighlighted = HIGHLIGHTED_REPOS.has(repo.name);

  const statusItems = [
    {
      label: "Live experience",
      detail: repo.homepageUrl ? "Ready to explore" : "Repository only",
      active: Boolean(repo.homepageUrl),
    },
    {
      label: "Source access",
      detail: repo.isPrivate ? "Private repository" : "Public on GitHub",
      active: !repo.isPrivate,
    },
    {
      label: "Project origin",
      detail: repo.isFork ? "Built from a fork" : "Original project",
      active: !repo.isFork,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="container pt-5 sm:pt-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.45,
            ease: [0.25, 1, 0.5, 1],
          }}
          className="relative overflow-hidden rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-8 lg:p-10"
        >
          <div className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-secondary/70 blur-3xl" />

          <div className="relative">
            <Link
              href="/"
              className="mb-7 inline-flex min-h-10 items-center gap-2 rounded-full border-2 border-border bg-background/80 px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:text-foreground active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to portfolio
            </Link>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] lg:items-end">
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    {repo.name}
                  </h1>
                  {isHighlighted && (
                    <Badge className="rounded-full border-2 border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-none hover:bg-primary/10">
                      <Sparkles className="mr-1 size-3" aria-hidden="true" />
                      Featured
                    </Badge>
                  )}
                </div>

                {(interpretation || repo.description) && (
                  <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {interpretation || repo.description}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  {repo.primaryLanguage?.name && (
                    <Badge
                      variant="outline"
                      className="rounded-full border-2 border-border bg-background/70 px-3 py-1.5 shadow-none"
                    >
                      <span
                        className="mr-1.5 size-2.5 rounded-full"
                        style={{ backgroundColor: langColor }}
                      />
                      {repo.primaryLanguage.name}
                    </Badge>
                  )}
                  {repo.homepageUrl && (
                    <Badge
                      variant="outline"
                      className="rounded-full border-2 border-primary/20 bg-primary/10 px-3 py-1.5 text-primary shadow-none"
                    >
                      <Globe className="mr-1 size-3" aria-hidden="true" />
                      Deployed
                    </Badge>
                  )}
                  {repo.isPrivate && (
                    <Badge
                      variant="outline"
                      className="rounded-full border-2 border-border bg-secondary px-3 py-1.5 text-secondary-foreground shadow-none"
                    >
                      <Lock className="mr-1 size-3" aria-hidden="true" />
                      Private
                    </Badge>
                  )}
                  {repo.isFork && (
                    <Badge
                      variant="outline"
                      className="rounded-full border-2 border-border bg-secondary px-3 py-1.5 text-secondary-foreground shadow-none"
                    >
                      <GitFork className="mr-1 size-3" aria-hidden="true" />
                      Fork
                    </Badge>
                  )}
                  {repo.stargazerCount > 0 && (
                    <Badge
                      variant="outline"
                      className="rounded-full border-2 border-border bg-background/70 px-3 py-1.5 text-muted-foreground shadow-none"
                    >
                      <Star className="mr-1 size-3" aria-hidden="true" />
                      {repo.stargazerCount} star
                      {repo.stargazerCount !== 1 ? "s" : ""}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="rounded-full border-2 border-border bg-background/70 px-3 py-1.5 text-muted-foreground shadow-none"
                  >
                    <Calendar className="mr-1 size-3" aria-hidden="true" />
                    {formatDate(repo.pushedAt)}
                  </Badge>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  {!repo.isPrivate && (
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${tactileLink} border-border bg-secondary text-secondary-foreground`}
                    >
                      <Github className="size-4" aria-hidden="true" />
                      View on GitHub
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  )}
                  {repo.homepageUrl && (
                    <a
                      href={repo.homepageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${tactileLink} border-primary bg-primary text-primary-foreground`}
                    >
                      <Globe className="size-4" aria-hidden="true" />
                      Live demo
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>

              <div className="rounded-[1.75rem] border-2 border-border bg-background/75 p-5 shadow-sm backdrop-blur-sm">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Project status
                </p>
                <ul className="space-y-3" aria-label="Project status checklist">
                  {statusItems.map(item => (
                    <li key={item.label} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border-2 ${
                          item.active
                            ? "border-primary/30 bg-primary/15 text-primary"
                            : "border-border bg-secondary text-muted-foreground"
                        }`}
                      >
                        {item.active ? (
                          <CheckCircle2 className="size-4" aria-hidden="true" />
                        ) : (
                          <Circle className="size-3.5" aria-hidden="true" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-foreground">
                          {item.label}
                        </span>
                        <span className="block text-xs leading-relaxed text-muted-foreground">
                          {item.detail}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      <main className="container py-6 sm:py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.45,
              delay: reduceMotion ? 0 : 0.12,
              ease: [0.25, 1, 0.5, 1],
            }}
            className="min-w-0 space-y-6"
          >
            {interpretation && (
              <section
                className="rounded-[1.75rem] border-2 border-primary/20 bg-primary/10 p-5 shadow-sm sm:p-6"
                aria-labelledby="interpretation-title"
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-full border-2 border-primary/20 bg-card text-primary">
                    <Sparkles className="size-4" aria-hidden="true" />
                  </span>
                  <h2
                    id="interpretation-title"
                    className="text-sm font-bold text-foreground"
                  >
                    A quick read on this project
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {interpretation}
                </p>
              </section>
            )}

            <section
              className="rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7 lg:p-9"
              aria-labelledby="readme-title"
            >
              <div className="mb-7 flex items-center gap-3 border-b-2 border-border pb-5">
                <span className="flex size-10 items-center justify-center rounded-full border-2 border-border bg-secondary text-secondary-foreground">
                  <Github className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 id="readme-title" className="font-bold text-foreground">
                    Project notes
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    README from the repository
                  </p>
                </div>
              </div>

              {repo.readme ? (
                <div className="prose-readme text-muted-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {repo.readme}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="rounded-[1.5rem] border-2 border-dashed border-border bg-secondary/40 px-5 py-14 text-center text-muted-foreground">
                  <p>No README content available for this repository.</p>
                </div>
              )}
            </section>
          </motion.div>

          <motion.aside
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.45,
              delay: reduceMotion ? 0 : 0.2,
              ease: [0.25, 1, 0.5, 1],
            }}
            className="space-y-5 lg:sticky lg:top-6"
          >
            {repo.description && (
              <section className="rounded-[1.75rem] border-2 border-border bg-card p-5 shadow-sm">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  In a sentence
                </h2>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {repo.description}
                </p>
              </section>
            )}

            <section className="rounded-[1.75rem] border-2 border-border bg-card p-5 shadow-sm">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Project details
              </h2>
              <dl className="space-y-3 text-sm">
                {repo.primaryLanguage?.name && (
                  <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                    <dt className="text-muted-foreground">Language</dt>
                    <dd className="flex items-center gap-1.5 font-semibold text-foreground">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: langColor }}
                      />
                      {repo.primaryLanguage.name}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                  <dt className="text-muted-foreground">Visibility</dt>
                  <dd className="font-semibold text-foreground">
                    {repo.isPrivate ? "Private" : "Public"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="font-semibold text-foreground">
                    {repo.isFork ? "Fork" : "Original"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                  <dt className="text-muted-foreground">Last pushed</dt>
                  <dd className="text-right font-semibold text-foreground">
                    {formatDate(repo.pushedAt)}
                  </dd>
                </div>
                {repo.stargazerCount > 0 && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">Stars</dt>
                    <dd className="font-semibold text-foreground">
                      {repo.stargazerCount}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            <section className="rounded-[1.75rem] border-2 border-border bg-card p-5 shadow-sm">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Take a look
              </h2>
              <div className="space-y-3">
                {!repo.isPrivate && (
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-12 items-center gap-3 rounded-2xl border-2 border-border bg-secondary/60 px-4 py-3 text-sm font-semibold text-secondary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-secondary hover:shadow-sm active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
                  >
                    <Github className="size-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">
                      {repo.url.replace("https://github.com/", "")}
                    </span>
                    <ExternalLink
                      className="size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                )}
                {repo.homepageUrl && (
                  <a
                    href={repo.homepageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-12 items-center gap-3 rounded-2xl border-2 border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/15 hover:shadow-sm active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
                  >
                    <Globe className="size-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">
                      {repo.homepageUrl.replace(/^https?:\/\//, "")}
                    </span>
                    <ExternalLink
                      className="size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                )}
              </div>
            </section>
          </motion.aside>
        </div>
      </main>

      <footer className="container pb-6 sm:pb-8">
        <div className="flex flex-col items-center justify-between gap-4 rounded-[1.75rem] border-2 border-border bg-card px-5 py-5 shadow-sm sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to portfolio
          </Link>
          <a
            href="https://github.com/Big-jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
          >
            <Github className="size-4" aria-hidden="true" />
            Big-jpg on GitHub
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  );
}
