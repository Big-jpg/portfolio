import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Github } from "lucide-react";
import repoSummaries from "@/data/repo-summaries.json";
import interpretations from "@/data/ai-interpretations.json";
import { FilterBar } from "@/components/FilterBar";
import { ProjectCard } from "@/components/ProjectCard";
import { RepositoryTree } from "@/components/RepositoryTree";
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

export default function Home() {
  const [language, setLanguage] = useState<FilterLanguage>("All");
  const [availability, setAvailability] = useState<FilterAvailability>("All");
  const [provenance, setProvenance] = useState<FilterProvenance>("All");
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
        Skip to all projects
      </a>

      <header className="site-nav-shell">
        <nav className="site-nav" aria-label="Primary navigation">
          <a
            href="#top"
            className="site-wordmark"
            aria-label="Big-jpg portfolio home"
          >
            <span aria-hidden="true" />
            BIG—JPG
          </a>
          <div>
            <a href="#work">Work</a>
            <a
              href="https://github.com/Big-jpg"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
              <ExternalLink aria-hidden="true" />
            </a>
          </div>
        </nav>
      </header>

      <RepositoryTree repos={allRepos} interpretations={interpretationMap} />

      <section
        id="work"
        className="work-section"
        aria-labelledby="work-heading"
      >
        <div className="work-heading-row">
          <div>
            <p className="eyebrow">The whole garden</p>
            <h1 id="work-heading">Seventy-five ways of asking “what if?”</h1>
          </div>
          <p className="work-intro">
            Data systems, playful experiments, agent workflows, geometry tools,
            and production apps—kept together in one gently sortable place.
          </p>
        </div>

        <dl className="repository-stats" aria-label="Portfolio overview">
          <div>
            <dt>Repositories</dt>
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
          <p>Swipe, scroll, or use the soft arrow keys.</p>
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
          <p className="eyebrow">Still curious?</p>
          <h2>Follow the next branch.</h2>
        </div>
        <a
          href="https://github.com/Big-jpg"
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
