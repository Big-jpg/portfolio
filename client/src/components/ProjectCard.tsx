import { Link } from "wouter";
import {
  ArrowUpRight,
  CheckCircle2,
  GitFork,
  Radio,
  Star,
  Wrench,
} from "lucide-react";
import { formatDate, LANGUAGE_COLORS } from "@/lib/repo-utils";
import { PORTFOLIO_IDENTITY } from "@/lib/identity";
import { CURATED_PROJECT_SUMMARIES } from "@/data/featured-work";
import type { RepoSummary } from "@/lib/types";

interface ProjectCardProps {
  repo: RepoSummary;
  interpretation?: string;
  index: number;
}

const CARD_TINTS = ["#DFF3EB", "#FFF2C9", "#E4F1FA", "#EEE7F8", "#FBE7E1"];

export function ProjectCard({ repo, interpretation, index }: ProjectCardProps) {
  const language = repo.primaryLanguage?.name || "Mixed stack";
  const languageColor = LANGUAGE_COLORS[language] || "#B7C8BD";
  const description =
    CURATED_PROJECT_SUMMARIES[repo.name] ||
    interpretation ||
    repo.description ||
    "A repository waiting for its field notes.";
  const affiliatedOwner =
    repo.ownerLogin && repo.ownerLogin !== PORTFOLIO_IDENTITY.handle
      ? repo.ownerLogin
      : null;

  return (
    <li className="repo-rail-item">
      <Link
        href={`/project/${encodeURIComponent(repo.name)}`}
        className="project-card"
        aria-label={`Open ${repo.name} project`}
        style={
          {
            "--card-tint": CARD_TINTS[index % CARD_TINTS.length],
          } as React.CSSProperties
        }
      >
        <span className="project-card-wash" aria-hidden="true" />

        <div className="project-card-topline">
          <span className="project-index">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="project-open-icon" aria-hidden="true">
            <ArrowUpRight />
          </span>
        </div>

        <div className="project-card-copy">
          <div className="project-meta-row">
            <div className="project-language">
              <span
                style={{ backgroundColor: languageColor }}
                aria-hidden="true"
              />
              {language}
            </div>
            {affiliatedOwner && (
              <span className="project-owner">with {affiliatedOwner}</span>
            )}
          </div>
          <h3>{repo.name}</h3>
          <p>{description}</p>
        </div>

        <div className="project-checklist" aria-label="Project status">
          <span>
            {repo.homepageUrl ? (
              <Radio aria-hidden="true" />
            ) : (
              <Wrench aria-hidden="true" />
            )}
            {repo.homepageUrl ? "Live on the web" : "In the workshop"}
          </span>
          <span>
            {repo.isFork ? (
              <GitFork aria-hidden="true" />
            ) : (
              <CheckCircle2 aria-hidden="true" />
            )}
            {repo.isFork ? "Built on open source" : "Original build"}
          </span>
          {repo.stargazerCount > 0 && (
            <span>
              <Star aria-hidden="true" />
              {repo.stargazerCount}{" "}
              {repo.stargazerCount === 1 ? "star" : "stars"}
            </span>
          )}
        </div>

        <div className="project-card-footer">
          <span>Updated {formatDate(repo.pushedAt)}</span>
          <strong>Open project</strong>
        </div>
      </Link>
    </li>
  );
}
