// client/src/pages/ProjectPage.tsx
// Design: Architectural Blueprint — project detail with metadata sidebar + README

import { useMemo } from "react";
import { Link, useParams } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
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
} from "lucide-react";
import repos from "@/data/repos.json";
import interpretations from "@/data/ai-interpretations.json";
import { LANGUAGE_COLORS, HIGHLIGHTED_REPOS, formatDate } from "@/lib/repo-utils";
import type { Repo } from "@/lib/types";

const DETAIL_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663056684383/K4rNGwLWbubJLq7tbzoQv8/project-detail-bg-2qfGnL3wtjz97WBtvgLnth.webp";

const allRepos = repos as Repo[];
const interpMap = interpretations as Record<string, string>;

export default function ProjectPage() {
  const params = useParams<{ name: string }>();
  const repoName = decodeURIComponent(params.name || "");

  const repo = useMemo(
    () => allRepos.find((r) => r.name === repoName),
    [repoName]
  );

  if (!repo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Project not found</h1>
          <p className="text-muted-foreground mb-4">
            No repository named "{repoName}" was found.
          </p>
          <Link href="/" className="text-primary hover:underline text-sm">
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header with background */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0">
          <img
            src={DETAIL_BG}
            alt=""
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background" />
        </div>

        <div className="relative container py-8 sm:py-12">
          {/* Back nav */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="size-4" />
              Back to portfolio
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Title row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                {repo.name}
              </h1>
              {isHighlighted && (
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                  Featured
                </Badge>
              )}
            </div>

            {/* Badge row */}
            <div className="flex flex-wrap gap-2 mb-5">
              {repo.primaryLanguage?.name && (
                <Badge variant="outline" className="gap-1.5 border-border/50">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: langColor }}
                  />
                  {repo.primaryLanguage.name}
                </Badge>
              )}
              {repo.homepageUrl && (
                <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-400">
                  <Globe className="size-3" />
                  Deployed
                </Badge>
              )}
              {repo.isPrivate && (
                <Badge variant="outline" className="gap-1 border-amber-500/30 text-amber-400">
                  <Lock className="size-3" />
                  Private
                </Badge>
              )}
              {repo.isFork && (
                <Badge variant="outline" className="gap-1 border-border/50 text-muted-foreground">
                  <GitFork className="size-3" />
                  Fork
                </Badge>
              )}
              {repo.stargazerCount > 0 && (
                <Badge variant="outline" className="gap-1 border-border/50 text-muted-foreground">
                  <Star className="size-3" />
                  {repo.stargazerCount} star{repo.stargazerCount !== 1 ? "s" : ""}
                </Badge>
              )}
              <Badge variant="outline" className="gap-1 border-border/50 text-muted-foreground">
                <Calendar className="size-3" />
                {formatDate(repo.pushedAt)}
              </Badge>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-3">
              {!repo.isPrivate && (
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-secondary/80 text-foreground text-sm font-medium hover:bg-secondary transition-colors"
                >
                  <Github className="size-4" />
                  View on GitHub
                  <ExternalLink className="size-3" />
                </a>
              )}
              {repo.homepageUrl && (
                <a
                  href={repo.homepageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Globe className="size-4" />
                  Live Demo
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="container py-8 sm:py-12">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">
          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="min-w-0"
          >
            {/* AI Interpretation Panel */}
            {interpretation && (
              <div className="mb-8 p-5 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="size-4 text-primary" />
                  <span className="text-xs text-primary font-medium uppercase tracking-wider">
                    AI Interpretation
                  </span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {interpretation}
                </p>
              </div>
            )}

            {/* README */}
            {repo.readme ? (
              <div className="prose-readme">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {repo.readme}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p>No README content available for this repository.</p>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Description */}
            {repo.description && (
              <div className="p-4 rounded-lg bg-card border border-border/50">
                <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                  Description
                </h3>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {repo.description}
                </p>
              </div>
            )}

            {/* Quick Info */}
            <div className="p-4 rounded-lg bg-card border border-border/50">
              <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
                Details
              </h3>
              <dl className="space-y-2.5 text-sm">
                {repo.primaryLanguage?.name && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Language</dt>
                    <dd className="text-foreground flex items-center gap-1.5">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: langColor }}
                      />
                      {repo.primaryLanguage.name}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Visibility</dt>
                  <dd className="text-foreground">{repo.isPrivate ? "Private" : "Public"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="text-foreground">{repo.isFork ? "Fork" : "Original"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Last pushed</dt>
                  <dd className="text-foreground">{formatDate(repo.pushedAt)}</dd>
                </div>
                {repo.stargazerCount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Stars</dt>
                    <dd className="text-foreground">{repo.stargazerCount}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Links */}
            <div className="p-4 rounded-lg bg-card border border-border/50">
              <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
                Links
              </h3>
              <div className="space-y-2">
                {!repo.isPrivate && (
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github className="size-4" />
                    <span className="truncate">{repo.url.replace("https://github.com/", "")}</span>
                    <ExternalLink className="size-3 shrink-0 ml-auto" />
                  </a>
                )}
                {repo.homepageUrl && (
                  <a
                    href={repo.homepageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Globe className="size-4" />
                    <span className="truncate">{repo.homepageUrl.replace(/^https?:\/\//, "")}</span>
                    <ExternalLink className="size-3 shrink-0 ml-auto" />
                  </a>
                )}
              </div>
            </div>
          </motion.aside>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="container py-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to portfolio
          </Link>
          <a
            href="https://github.com/Big-jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            <Github className="size-3.5" />
            Big-jpg
          </a>
        </div>
      </footer>
    </div>
  );
}
