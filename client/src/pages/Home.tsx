import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Github,
  MapPin,
} from "lucide-react";
import { Link } from "wouter";
import repoSummaries from "@/data/repo-summaries.json";
import interpretations from "@/data/ai-interpretations.json";
import { FEATURED_WORK } from "@/data/featured-work";
import { FilterBar } from "@/components/FilterBar";
import { ProjectCard } from "@/components/ProjectCard";
import { PORTFOLIO_IDENTITY } from "@/lib/identity";
import { filterRepos, getLanguages, sortByPushedAt } from "@/lib/repo-utils";
import type {
  FilterAvailability,
  FilterLanguage,
  FilterProvenance,
  RepoSummary,
} from "@/lib/types";

const allRepos = sortByPushedAt(repoSummaries as RepoSummary[]);
const allLanguages = getLanguages(allRepos);
const interpretationMap = interpretations as Record<string, string>;

const deployedCount = allRepos.filter(repo => repo.homepageUrl).length;
const originalCount = allRepos.filter(repo => !repo.isFork).length;
const featuredProjects = FEATURED_WORK.map(feature => {
  const repo = allRepos.find(candidate => candidate.name === feature.name);
  return repo ? { feature, repo } : null;
}).filter(
  (project): project is NonNullable<typeof project> => project !== null
);

export default function Home() {
  const [language, setLanguage] = useState<FilterLanguage>("All");
  const [availability, setAvailability] = useState<FilterAvailability>("Live");
  const [provenance, setProvenance] = useState<FilterProvenance>("Original");
  const railRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(
    () => filterRepos(allRepos, { language, availability, provenance }),
    [availability, language, provenance]
  );

  const resetFilters = () => {
    setLanguage("All");
    setAvailability("All");
    setProvenance("All");
  };

  const moveRail = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * Math.min(rail.clientWidth * 0.78, 520),
      behavior: "smooth",
    });
  };

  return (
    <main id="top" className="portfolio-shell">
      <a href="#work" className="skip-link">
        Skip to selected work
      </a>

      <header className="site-nav-shell">
        <nav className="site-nav" aria-label="Primary navigation">
          <a
            href="#top"
            className="site-wordmark"
            aria-label={`${PORTFOLIO_IDENTITY.displayName}, Solution Architect, portfolio home`}
          >
            <img
              src={PORTFOLIO_IDENTITY.avatarUrl}
              alt=""
              width="36"
              height="36"
              className="site-avatar"
            />
            <span className="site-wordmark-copy">
              <strong>ROSS FARRELL</strong>
              <small>Solution Architect</small>
            </span>
          </a>
          <div>
            <a href="#work">Selected work</a>
            <a href="#archive">Archive</a>
            <a
              href={PORTFOLIO_IDENTITY.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
              <ExternalLink aria-hidden="true" />
            </a>
          </div>
        </nav>
      </header>

      <section className="architect-hero" aria-labelledby="hero-heading">
        <div className="architect-hero-grid">
          <div className="architect-hero-copy">
            <h1 id="hero-heading">Modern web, AI, and systems—made real.</h1>
            <p className="architect-hero-lead">
              I design and build across TypeScript, React, Next.js, cloud, AI,
              data, integration, and identity.
            </p>
            <div className="architect-hero-actions">
              <a href="#work" className="primary-action">
                Explore selected work
                <ArrowRight aria-hidden="true" />
              </a>
              <a
                href={PORTFOLIO_IDENTITY.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="secondary-action"
              >
                <Github aria-hidden="true" />
                View GitHub
              </a>
            </div>
            <p className="architect-location">
              <MapPin aria-hidden="true" />
              Perth, Western Australia
            </p>
          </div>
        </div>
      </section>

      <section
        id="work"
        className="featured-work-section"
        aria-labelledby="work-heading"
      >
        <h2 id="work-heading" className="sr-only">
          Selected work
        </h2>
        <div className="work-flow-motif" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <ul className="featured-work-grid">
          {featuredProjects.map(({ feature, repo }) => (
            <li key={feature.name} className="featured-work-card">
              <span className="featured-card-pulse" aria-hidden="true" />
              <div className="featured-card-copy">
                <h3>{feature.title}</h3>
                <p>{feature.summary}</p>
              </div>
              <ul aria-label={`${feature.title} architecture signals`}>
                {feature.architecture.map(item => (
                  <li key={item}>
                    <CheckCircle2 aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="featured-card-actions">
                <Link href={`/project/${encodeURIComponent(repo.name)}`}>
                  Read project notes
                  <ArrowRight aria-hidden="true" />
                </Link>
                {(feature.liveUrl || repo.homepageUrl) && (
                  <a
                    href={feature.liveUrl || repo.homepageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live experience
                    <ExternalLink aria-hidden="true" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="archive"
        className="work-section archive-section"
        aria-labelledby="archive-heading"
      >
        <div className="work-heading-row">
          <div>
            <p className="eyebrow">Complete project archive</p>
            <h2 id="archive-heading">Breadth, without the noise.</h2>
          </div>
          <p className="work-intro">
            The archive starts with live, original work. Change the filters to
            explore experiments, works in progress, collaborations, and forks.
          </p>
        </div>

        <dl className="repository-stats" aria-label="Portfolio overview">
          <div>
            <dt>Public projects</dt>
            <dd>{allRepos.length}</dd>
          </div>
          <div>
            <dt>Live now</dt>
            <dd>{deployedCount}</dd>
          </div>
          <div>
            <dt>Original builds</dt>
            <dd>{originalCount}</dd>
          </div>
          <div>
            <dt>Languages</dt>
            <dd>{allLanguages.length}</dd>
          </div>
        </dl>

        <FilterBar
          languages={allLanguages}
          activeLanguage={language}
          activeAvailability={availability}
          activeProvenance={provenance}
          onLanguageChange={setLanguage}
          onAvailabilityChange={setAvailability}
          onProvenanceChange={setProvenance}
          onReset={resetFilters}
          totalCount={allRepos.length}
          filteredCount={filtered.length}
        />

        <div className="rail-heading">
          <p>
            Showing {filtered.length} projects. Swipe, scroll, or use the arrow
            controls.
          </p>
          <div className="rail-controls" aria-label="Repository rail controls">
            <button
              type="button"
              onClick={() => moveRail(-1)}
              aria-label="Previous projects"
            >
              <ArrowLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => moveRail(1)}
              aria-label="Next projects"
            >
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>

        {filtered.length > 0 ? (
          <ul
            ref={railRef}
            className="repository-rail"
            aria-label="Repository projects"
          >
            {filtered.map((repo, index) => (
              <ProjectCard
                key={repo.name}
                repo={repo}
                interpretation={interpretationMap[repo.name]}
                index={index}
              />
            ))}
          </ul>
        ) : (
          <div className="empty-projects">
            <span aria-hidden="true">○</span>
            <h2>No projects in this branch—yet.</h2>
            <p>Reset the filters to return to the full collection.</p>
            <button type="button" onClick={resetFilters}>
              Show everything
            </button>
          </div>
        )}
      </section>

      <footer className="site-footer">
        <div>
          <p className="eyebrow">Ross Elliot Farrell</p>
          <h2>Architecture that stays connected to delivery.</h2>
        </div>
        <a
          href={PORTFOLIO_IDENTITY.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github aria-hidden="true" />
          github.com/Big-jpg
          <ExternalLink aria-hidden="true" />
        </a>
      </footer>
    </main>
  );
}
