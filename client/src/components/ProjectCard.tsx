// client/src/components/ProjectCard.tsx
// Design: Architectural Blueprint — slate card with blue glow hover, depth layers

import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { LANGUAGE_COLORS, HIGHLIGHTED_REPOS, formatDate } from "@/lib/repo-utils";
import type { Repo } from "@/lib/types";
import { Lock, GitFork, Globe, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface ProjectCardProps {
  repo: Repo;
  interpretation?: string;
  index: number;
}

export function ProjectCard({ repo, interpretation, index }: ProjectCardProps) {
  const langColor = repo.primaryLanguage?.name
    ? LANGUAGE_COLORS[repo.primaryLanguage.name] || "#6b7280"
    : "#6b7280";
  const isHighlighted = HIGHLIGHTED_REPOS.has(repo.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.8) }}
    >
      <Link href={`/project/${encodeURIComponent(repo.name)}`}>
        <div
          className={`group relative flex flex-col h-full rounded-lg border transition-all duration-250 cursor-pointer
            ${isHighlighted
              ? "border-primary/30 bg-[oklch(0.19_0.04_255)]"
              : "border-border/60 bg-card"
            }
            hover:border-primary/50 hover:shadow-[0_0_20px_oklch(0.62_0.19_255_/_0.08)] hover:-translate-y-0.5`}
        >
          {/* Top accent line for highlighted repos */}
          {isHighlighted && (
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-t-lg" />
          )}

          <div className="p-5 flex flex-col gap-3 flex-1">
            {/* Header: name + badges */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-[15px] leading-tight truncate">
                {repo.name}
              </h3>
              {repo.stargazerCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Star className="size-3" />
                  {repo.stargazerCount}
                </span>
              )}
            </div>

            {/* Badge row */}
            <div className="flex flex-wrap gap-1.5">
              {repo.primaryLanguage?.name && (
                <Badge variant="outline" className="text-[11px] px-2 py-0 h-5 gap-1.5 border-border/50">
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: langColor }}
                  />
                  {repo.primaryLanguage.name}
                </Badge>
              )}
              {repo.homepageUrl && (
                <Badge variant="outline" className="text-[11px] px-2 py-0 h-5 gap-1 border-emerald-500/30 text-emerald-400">
                  <Globe className="size-2.5" />
                  Deployed
                </Badge>
              )}
              {repo.isPrivate && (
                <Badge variant="outline" className="text-[11px] px-2 py-0 h-5 gap-1 border-amber-500/30 text-amber-400">
                  <Lock className="size-2.5" />
                  Private
                </Badge>
              )}
              {repo.isFork && (
                <Badge variant="outline" className="text-[11px] px-2 py-0 h-5 gap-1 border-border/50 text-muted-foreground">
                  <GitFork className="size-2.5" />
                  Fork
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
              {interpretation || repo.description || "No description available"}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1 mt-auto">
              <span className="text-xs text-muted-foreground/70">
                {formatDate(repo.pushedAt)}
              </span>
              <span className="flex items-center gap-1 text-xs text-primary/70 group-hover:text-primary transition-colors">
                View
                <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
