import { motion, useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import type {
  FilterAvailability,
  FilterLanguage,
  FilterProvenance,
} from "@/lib/types";

interface FilterBarProps {
  languages: string[];
  activeLanguage: FilterLanguage;
  activeAvailability: FilterAvailability;
  activeProvenance: FilterProvenance;
  onLanguageChange: (language: FilterLanguage) => void;
  onAvailabilityChange: (availability: FilterAvailability) => void;
  onProvenanceChange: (provenance: FilterProvenance) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
}

const AVAILABILITY_OPTIONS: FilterAvailability[] = ["All", "Live", "Workshop"];
const PROVENANCE_OPTIONS: FilterProvenance[] = ["All", "Original", "Fork"];

export function FilterBar({
  languages,
  activeLanguage,
  activeAvailability,
  activeProvenance,
  onLanguageChange,
  onAvailabilityChange,
  onProvenanceChange,
  onReset,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  const reduceMotion = useReducedMotion();
  const isFiltered =
    activeLanguage !== "All" ||
    activeAvailability !== "All" ||
    activeProvenance !== "All";

  return (
    <div className="repo-toolbar" aria-label="Repository filters">
      <SegmentControl
        label="Availability"
        options={AVAILABILITY_OPTIONS}
        active={activeAvailability}
        onChange={onAvailabilityChange}
        layoutId="availability-filter"
        reduceMotion={Boolean(reduceMotion)}
      />

      <SegmentControl
        label="Source"
        options={PROVENANCE_OPTIONS}
        active={activeProvenance}
        onChange={onProvenanceChange}
        layoutId="provenance-filter"
        reduceMotion={Boolean(reduceMotion)}
        labels={{ All: "Any", Fork: "Forks" }}
      />

      <label className="filter-select-wrap">
        <span>Language</span>
        <select
          value={activeLanguage}
          onChange={event => onLanguageChange(event.target.value)}
          aria-label="Filter repositories by language"
        >
          <option value="All">All languages</option>
          {languages.map(language => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>
      </label>

      <div className="repo-filter-result">
        <output aria-live="polite">
          <strong>{filteredCount}</strong>
          <span>of {totalCount}</span>
        </output>
        {isFiltered && (
          <button type="button" onClick={onReset} className="filter-reset">
            <RotateCcw aria-hidden="true" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

interface SegmentControlProps<T extends string> {
  label: string;
  options: T[];
  active: T;
  onChange: (value: T) => void;
  layoutId: string;
  reduceMotion: boolean;
  labels?: Partial<Record<T, string>>;
}

function SegmentControl<T extends string>({
  label,
  options,
  active,
  onChange,
  layoutId,
  reduceMotion,
  labels,
}: SegmentControlProps<T>) {
  return (
    <div className="filter-group">
      <span className="filter-label">{label}</span>
      <div className="segment-control" role="group" aria-label={label}>
        {options.map(option => (
          <button
            key={option}
            type="button"
            aria-pressed={active === option}
            onClick={() => onChange(option)}
          >
            {active === option && (
              <motion.span
                layoutId={layoutId}
                className="segment-active"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.42, ease: [0.25, 1, 0.5, 1] }
                }
              />
            )}
            <span className="segment-label">{labels?.[option] ?? option}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
