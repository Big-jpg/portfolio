// client/src/pages/Home.tsx
// Design: Architectural Blueprint — asymmetric hero, sticky filters, 3-col grid

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Github, ExternalLink, Code2, Rocket, Lock, GitFork } from "lucide-react";
import repos from "@/data/repos.json";
import interpretations from "@/data/ai-interpretations.json";
import { ProjectCard } from "@/components/ProjectCard";
import { FilterBar } from "@/components/FilterBar";
import { getLanguages, filterRepos, sortByPushedAt } from "@/lib/repo-utils";
import type { Repo, FilterLanguage, FilterType } from "@/lib/types";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663056684383/K4rNGwLWbubJLq7tbzoQv8/hero-bg-Z4BagEehF8SFQhwf8YEgFR.webp";

const allRepos = sortByPushedAt(repos as Repo[]);
const allLanguages = getLanguages(allRepos);
const interpMap = interpretations as Record<string, string>;

// Stats
const deployedCount = allRepos.filter((r) => r.homepageUrl).length;
const languageCount = allLanguages.length;
const privateCount = allRepos.filter((r) => r.isPrivate).length;
const forkCount = allRepos.filter((r) => r.isFork).length;

export default function Home() {
  const [language, setLanguage] = useState<FilterLanguage>("All");
  const [type, setType] = useState<FilterType>("All");

  const filtered = useMemo(
    () => filterRepos(allRepos, { language, type }),
    [language, type]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src={HERO_BG}
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        </div>

        <div className="relative container py-16 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-end">
            {/* Left: Name + Bio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="size-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                  Developer Portfolio
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-5">
                Big-jpg
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                Data and automation architect building across the full stack — from Power BI semantic model parsers
                and Azure OCR pipelines to interactive 3D web experiences and computational geometry tools.
                Fluent in TypeScript, Python, and C++, with a bias toward explicit control and system-level reasoning.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <a
                  href="https://github.com/Big-jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary/80 text-foreground text-sm font-medium hover:bg-secondary transition-colors"
                >
                  <Github className="size-4" />
                  GitHub
                </a>
              </div>
            </motion.div>

            {/* Right: Stats grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="grid grid-cols-2 gap-3 lg:gap-4"
            >
              <StatCard icon={<Code2 className="size-4" />} value={allRepos.length} label="Repositories" />
              <StatCard icon={<Rocket className="size-4" />} value={deployedCount} label="Deployed" />
              <StatCard icon={<Lock className="size-4" />} value={privateCount} label="Private" />
              <StatCard icon={<GitFork className="size-4" />} value={forkCount} label="Forks" />
            </motion.div>
          </div>
        </div>

        {/* Thin accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </section>

      {/* Filter + Grid Section */}
      <section className="container py-10 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <FilterBar
            languages={allLanguages}
            activeLanguage={language}
            activeType={type}
            onLanguageChange={setLanguage}
            onTypeChange={setType}
            totalCount={allRepos.length}
            filteredCount={filtered.length}
          />
        </motion.div>

        {/* Project Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((repo, i) => (
            <ProjectCard
              key={repo.name}
              repo={repo}
              interpretation={interpMap[repo.name]}
              index={i}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No repositories match the current filters.</p>
            <button
              onClick={() => { setLanguage("All"); setType("All"); }}
              className="mt-3 text-primary hover:underline text-sm"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="container py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/60">
            {allRepos.length} repositories across {languageCount} languages
          </p>
          <a
            href="https://github.com/Big-jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            <Github className="size-3.5" />
            github.com/Big-jpg
            <ExternalLink className="size-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-lg bg-card/80 border border-border/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs uppercase tracking-wider font-medium">{label}</span>
      </div>
      <span className="text-2xl font-bold text-foreground tabular-nums">{value}</span>
    </div>
  );
}
