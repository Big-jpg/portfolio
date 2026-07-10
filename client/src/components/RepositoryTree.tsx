import { useMemo, useRef, useState } from "react";
import {
  motion,
  type MotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowDown, ArrowRight, GitFork, Radio, Wrench } from "lucide-react";
import { Link } from "wouter";
import {
  buildRepoTree,
  type RepoTreeAvailabilityNode,
  type RepoTreeRepoNode,
  type RepoTreeTerminalNode,
} from "@/lib/repo-tree";
import { PORTFOLIO_IDENTITY } from "@/lib/identity";
import { LANGUAGE_COLORS } from "@/lib/repo-utils";
import type { RepoSummary } from "@/lib/types";

interface RepositoryTreeProps {
  repos: RepoSummary[];
  interpretations?: Readonly<Record<string, string | undefined>>;
}

const LEAF_TINTS = ["#DDF2EA", "#FFF0BE", "#DDEEF9", "#E9DFF6"];

export function RepositoryTree({
  repos,
  interpretations,
}: RepositoryTreeProps) {
  const tree = useMemo(
    () => buildRepoTree(repos, { interpretations }),
    [interpretations, repos]
  );
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState(reduceMotion ? 4 : 0);
  const storyRef = useRef<HTMLElement>(null);
  const { scrollYProgress: storyScroll } = useScroll({
    target: storyRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(storyScroll, {
    stiffness: 110,
    damping: 32,
    mass: 0.6,
  });

  useMotionValueEvent(progress, "change", value => {
    if (reduceMotion) return;
    const nextStage =
      value >= 0.62
        ? 4
        : value >= 0.36
          ? 3
          : value >= 0.24
            ? 2
            : value >= 0.12
              ? 1
              : 0;
    setStage(current => (current === nextStage ? current : nextStage));
  });

  const backgroundColor = useTransform(
    progress,
    [0, 0.42, 1],
    ["#FFFFFF", "#FAFCFA", "#F5F9F6"]
  );
  const rootY = useTransform(progress, [0, 0.12], ["26vh", "0vh"]);
  const rootScale = useTransform(progress, [0, 0.12], [1.08, 1]);
  const introOpacity = useTransform(progress, [0, 0.08, 0.13], [1, 1, 0]);
  const firstOpacity = useTransform(progress, [0.12, 0.18], [0, 1]);
  const firstScale = useTransform(progress, [0.12, 0.18], [0.9, 1]);
  const secondOpacity = useTransform(progress, [0.24, 0.3], [0, 1]);
  const secondScale = useTransform(progress, [0.24, 0.3], [0.9, 1]);
  const leafOpacity = useTransform(progress, [0.36, 0.44], [0, 1]);
  const leafScale = useTransform(progress, [0.36, 0.44], [0.88, 1]);
  const leafMetaOpacity = useTransform(progress, [0.42, 0.48], [0, 1]);
  const finishOpacity = useTransform(progress, [0.62, 0.7], [0, 1]);
  const ambientShift = useTransform(progress, [0, 1], [0, 42]);
  const ambientShiftBlue = useTransform(progress, [0, 1], [0, -36]);

  const terminalNodes = tree.children.flatMap(branch => branch.children);
  const repoNodes = terminalNodes.flatMap(branch => branch.children);
  const stageLabels = [
    `${tree.count} public repositories indexed`,
    `2 paths across ${tree.count} public repositories`,
    `4 groups across ${tree.count} public repositories`,
    `${repoNodes.length} featured here · ${tree.count} indexed`,
    `All ${tree.count} public repositories are below`,
  ];

  return (
    <section
      ref={storyRef}
      className={`repo-tree-story${reduceMotion ? " is-reduced" : ""}`}
      aria-label="Repository discovery tree"
    >
      <motion.div className="tree-stage" style={{ backgroundColor }}>
        <motion.div
          className="tree-ambient tree-ambient-mint"
          style={{ y: ambientShift }}
          aria-hidden="true"
        />
        <motion.div
          className="tree-ambient tree-ambient-blue"
          style={{ y: ambientShiftBlue }}
          aria-hidden="true"
        />

        <div className="tree-desktop">
          <motion.p
            className="tree-chapter-label"
            style={{ opacity: reduceMotion ? 1 : firstOpacity }}
          >
            A living map of the work
          </motion.p>
          <div className="tree-index-status" aria-hidden="true">
            <span />
            <b>{stage + 1}/5</b>
            {stageLabels[stage]}
          </div>

          <div className="tree-node-position tree-root-position">
            <motion.div
              className="tree-node tree-root-node"
              style={{
                y: reduceMotion ? 0 : rootY,
                scale: reduceMotion ? 1 : rootScale,
              }}
            >
              <img
                src={PORTFOLIO_IDENTITY.avatarUrl}
                alt=""
                width="44"
                height="44"
                className="tree-root-avatar"
              />
              <span>
                <strong>
                  {PORTFOLIO_IDENTITY.handle}
                  <em>{PORTFOLIO_IDENTITY.displayName}</em>
                </strong>
                <small>{tree.count} public repositories indexed</small>
              </span>
            </motion.div>
          </div>

          <motion.div
            className="tree-intro-copy"
            style={{ opacity: reduceMotion ? 0 : introOpacity }}
          >
            <p>One small place to begin.</p>
            <span>
              Scroll to reveal {repoNodes.length} featured paths
              <ArrowDown aria-hidden="true" />
            </span>
          </motion.div>

          <TreeConnectors
            firstProgress={firstOpacity}
            secondProgress={secondOpacity}
            leafProgress={leafOpacity}
            reduceMotion={Boolean(reduceMotion)}
          />

          {tree.children.map((branch, index) => (
            <PositionedNode
              key={branch.id}
              x={index === 0 ? 25 : 75}
              level="first"
            >
              <motion.div
                className={`tree-node tree-availability-node is-${branch.id}`}
                style={{
                  opacity: reduceMotion ? 1 : firstOpacity,
                  scale: reduceMotion ? 1 : firstScale,
                }}
              >
                {branch.id === "live" ? (
                  <Radio aria-hidden="true" />
                ) : (
                  <Wrench aria-hidden="true" />
                )}
                <span>
                  <strong>{branch.label}</strong>
                  <small>{branch.count} projects</small>
                </span>
              </motion.div>
            </PositionedNode>
          ))}

          {terminalNodes.map((branch, index) => (
            <PositionedNode
              key={branch.id}
              x={12.5 + index * 25}
              level="second"
            >
              <motion.div
                className={`tree-node tree-terminal-node is-${branch.provenance}`}
                style={{
                  opacity: reduceMotion ? 1 : secondOpacity,
                  scale: reduceMotion ? 1 : secondScale,
                }}
              >
                {branch.provenance === "fork" && <GitFork aria-hidden="true" />}
                <span>
                  <strong>{branch.label}</strong>
                  <small>{branch.count}</small>
                </span>
              </motion.div>
            </PositionedNode>
          ))}

          {repoNodes.map((node, index) => (
            <PositionedNode key={node.id} x={6.25 + index * 12.5} level="leaf">
              <motion.div
                style={{
                  opacity: reduceMotion ? 1 : leafOpacity,
                  scale: reduceMotion ? 1 : leafScale,
                }}
              >
                <RepoLeaf
                  node={node}
                  tint={LEAF_TINTS[index % LEAF_TINTS.length]}
                  metaOpacity={reduceMotion ? 1 : leafMetaOpacity}
                  tabIndex={stage >= 3 || reduceMotion ? 0 : -1}
                />
              </motion.div>
            </PositionedNode>
          ))}

          <motion.a
            href="#work"
            className="tree-finish-cue"
            style={{ opacity: reduceMotion ? 1 : finishOpacity }}
            tabIndex={stage >= 4 || reduceMotion ? 0 : -1}
          >
            Browse all {tree.count} public repositories
            <ArrowDown aria-hidden="true" />
          </motion.a>
        </div>

        <MobileTree
          branches={tree.children}
          count={tree.count}
          reduceMotion={Boolean(reduceMotion)}
        />
      </motion.div>
    </section>
  );
}

interface PositionedNodeProps {
  x: number;
  level: "first" | "second" | "leaf";
  children: React.ReactNode;
}

function PositionedNode({ x, level, children }: PositionedNodeProps) {
  return (
    <div
      className={`tree-node-position tree-${level}-position`}
      style={{ "--tree-x": `${x}%` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

interface TreeConnectorsProps {
  firstProgress: MotionValue<number>;
  secondProgress: MotionValue<number>;
  leafProgress: MotionValue<number>;
  reduceMotion: boolean;
}

function TreeConnectors({
  firstProgress,
  secondProgress,
  leafProgress,
  reduceMotion,
}: TreeConnectorsProps) {
  const first = reduceMotion ? 1 : firstProgress;
  const second = reduceMotion ? 1 : secondProgress;
  const leaves = reduceMotion ? 1 : leafProgress;

  return (
    <div className="tree-connectors" aria-hidden="true">
      <motion.span className="tree-line root-stem" style={{ scaleY: first }} />
      <motion.span className="tree-line root-bar" style={{ scaleX: first }} />
      {[25, 75].map(x => (
        <motion.span
          key={`root-drop-${x}`}
          className="tree-line root-drop"
          style={{ left: `calc(${x}% - 1.5px)`, scaleY: first }}
        />
      ))}

      {[25, 75].map((x, groupIndex) => (
        <span key={`second-${x}`}>
          <motion.span
            className="tree-line second-stem"
            style={{ left: `calc(${x}% - 1.5px)`, scaleY: second }}
          />
          <motion.span
            className="tree-line second-bar"
            style={{
              left: `${12.5 + groupIndex * 50}%`,
              scaleX: second,
            }}
          />
          {[12.5 + groupIndex * 50, 37.5 + groupIndex * 50].map(dropX => (
            <motion.span
              key={dropX}
              className="tree-line second-drop"
              style={{
                left: `calc(${dropX}% - 1.5px)`,
                scaleY: second,
              }}
            />
          ))}
        </span>
      ))}

      {[12.5, 37.5, 62.5, 87.5].map((x, groupIndex) => (
        <span key={`leaf-${x}`}>
          <motion.span
            className="tree-line leaf-stem"
            style={{ left: `calc(${x}% - 1.5px)`, scaleY: leaves }}
          />
          <motion.span
            className="tree-line leaf-bar"
            style={{ left: `${6.25 + groupIndex * 25}%`, scaleX: leaves }}
          />
          {[6.25 + groupIndex * 25, 18.75 + groupIndex * 25].map(dropX => (
            <motion.span
              key={dropX}
              className="tree-line leaf-drop"
              style={{ left: `calc(${dropX}% - 1.5px)`, scaleY: leaves }}
            />
          ))}
        </span>
      ))}
    </div>
  );
}

interface RepoLeafProps {
  node: RepoTreeRepoNode;
  tint: string;
  metaOpacity?: number | MotionValue<number>;
  tabIndex?: number;
}

function RepoLeaf({ node, tint, metaOpacity = 1, tabIndex }: RepoLeafProps) {
  const language = node.repo.primaryLanguage?.name || "Mixed";
  return (
    <Link
      href={`/project/${encodeURIComponent(node.repo.name)}`}
      className="tree-node tree-repo-node"
      style={{ "--leaf-tint": tint } as React.CSSProperties}
      tabIndex={tabIndex}
      aria-label={`Open ${node.repo.name} project`}
    >
      <strong title={node.repo.name}>{node.repo.name}</strong>
      <motion.small style={{ opacity: metaOpacity }}>
        <span
          style={{ backgroundColor: LANGUAGE_COLORS[language] || "#B7C8BD" }}
          aria-hidden="true"
        />
        {language}
      </motion.small>
      <ArrowRight aria-hidden="true" />
    </Link>
  );
}

interface MobileTreeProps {
  branches: [RepoTreeAvailabilityNode, RepoTreeAvailabilityNode];
  count: number;
  reduceMotion: boolean;
}

function MobileTree({ branches, count, reduceMotion }: MobileTreeProps) {
  const reveal = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: {
      duration: reduceMotion ? 0 : 0.5,
      delay,
      ease: [0.25, 1, 0.5, 1] as const,
    },
  });

  return (
    <div className="tree-mobile">
      <div className="mobile-tree-intro">
        <div className="tree-node tree-root-node">
          <img
            src={PORTFOLIO_IDENTITY.avatarUrl}
            alt=""
            width="44"
            height="44"
            className="tree-root-avatar"
          />
          <span>
            <strong>
              {PORTFOLIO_IDENTITY.handle}
              <em>{PORTFOLIO_IDENTITY.displayName}</em>
            </strong>
            <small>{count} public repositories indexed</small>
          </span>
        </div>
        <p>One small place to begin.</p>
        <span className="mobile-scroll-cue">
          Scroll to let the work branch out
          <ArrowDown aria-hidden="true" />
        </span>
      </div>

      <div className="mobile-tree-flow">
        <p className="eyebrow">A living map of the work</p>
        <h2>Each branch opens into something real.</h2>
        <p className="mobile-tree-context">
          Eight featured projects from {count} public repositories. The complete
          archive follows below.
        </p>

        {branches.map((branch, branchIndex) => (
          <motion.section
            key={branch.id}
            className={`mobile-availability is-${branch.id}`}
            {...reveal(branchIndex * 0.05)}
          >
            <header>
              {branch.id === "live" ? (
                <Radio aria-hidden="true" />
              ) : (
                <Wrench aria-hidden="true" />
              )}
              <span>
                <strong>{branch.label}</strong>
                <small>{branch.count} projects</small>
              </span>
            </header>

            <div className="mobile-terminal-grid">
              {branch.children.map((terminal, terminalIndex) => (
                <MobileTerminal
                  key={terminal.id}
                  terminal={terminal}
                  tintOffset={branchIndex * 2 + terminalIndex}
                />
              ))}
            </div>
          </motion.section>
        ))}

        <a href="#work" className="mobile-tree-finish">
          Browse all {count} public repositories
          <ArrowDown aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

function MobileTerminal({
  terminal,
  tintOffset,
}: {
  terminal: RepoTreeTerminalNode;
  tintOffset: number;
}) {
  return (
    <div className={`mobile-terminal is-${terminal.provenance}`}>
      <div className="mobile-terminal-heading">
        {terminal.provenance === "fork" && <GitFork aria-hidden="true" />}
        <span>
          <strong>{terminal.label}</strong>
          <small>{terminal.count} repositories</small>
        </span>
      </div>
      <ul>
        {terminal.children.map((node, index) => (
          <li key={node.id}>
            <RepoLeaf
              node={node}
              tint={LEAF_TINTS[(tintOffset + index) % LEAF_TINTS.length]}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
