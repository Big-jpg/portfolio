// client/src/components/FilterBar.tsx
// Design: Architectural Blueprint — horizontal filter chips with active state

import { LANGUAGE_COLORS } from "@/lib/repo-utils";
import type { FilterLanguage, FilterType } from "@/lib/types";

interface FilterBarProps {
  languages: string[];
  activeLanguage: FilterLanguage;
  activeType: FilterType;
  onLanguageChange: (lang: FilterLanguage) => void;
  onTypeChange: (type: FilterType) => void;
  totalCount: number;
  filteredCount: number;
}

const TYPE_OPTIONS: FilterType[] = ["All", "Deployed", "Original", "Private", "Fork"];

export function FilterBar({
  languages,
  activeLanguage,
  activeType,
  onLanguageChange,
  onTypeChange,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Type filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium mr-1">Type</span>
        {TYPE_OPTIONS.map((type) => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
              ${activeType === type
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Language filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium mr-1">Lang</span>
        <button
          onClick={() => onLanguageChange("All")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
            ${activeLanguage === "All"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
        >
          All
        </button>
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5
              ${activeLanguage === lang
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
          >
            <span
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: LANGUAGE_COLORS[lang] || "#6b7280" }}
            />
            {lang}
          </button>
        ))}
      </div>

      {/* Count indicator */}
      <div className="text-xs text-muted-foreground/70">
        Showing <span className="text-foreground font-medium">{filteredCount}</span> of{" "}
        <span className="text-foreground font-medium">{totalCount}</span> repositories
      </div>
    </div>
  );
}
