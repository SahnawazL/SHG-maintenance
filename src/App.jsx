import { useMemo, useState } from "react";
import { Wallet, FileText, ChevronRight, Search, MapPin, X, Plus, Minus, Lock, CreditCard } from "lucide-react";
import WeeklyCollection from "./tools/WeeklyCollection.jsx";
import ResolutionLog from "./tools/ResolutionLog.jsx";
import GroupIDCard from "./tools/GroupIDCard.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import { useTheme } from "./lib/theme.js";
import { SHG_DIRECTORY, flattenDirectory } from "./lib/shgDirectory.js";
import { findRosterByName } from "./lib/memberRosters.js";

const inputClass =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-stone-100 dark:focus:ring-emerald-500 dark:focus:border-emerald-500 dark:placeholder:text-neutral-600";

// Shared keyboard-focus ring for buttons and other non-text-input controls
// (text inputs already get their own ring via inputClass). Inset so it
// renders correctly regardless of what background/overflow container the
// element sits in, and only shows for keyboard focus (not mouse clicks).
const focusRingClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600 dark:focus-visible:ring-emerald-500";

// Shared keyframes for the autocomplete/option-list pop-in (suggestIn) and the
// full-screen transition between setup / WeeklyCollection / ResolutionLog
// (screenIn). Declared once and re-injected via <style> on whichever screen
// is mounted, since the three screens are separate top-level returns.
const SCREEN_ANIM_CSS = `
  @keyframes suggestIn {
    from { opacity: 0; transform: scaleY(0.96) translateY(-2px); }
    to { opacity: 1; transform: scaleY(1) translateY(0); }
  }
  @keyframes screenIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    @keyframes suggestIn { from, to { opacity: 1; transform: none; } }
    @keyframes screenIn { from, to { opacity: 1; transform: none; } }
  }

  /* Slim scrollbar for the app's overflow-y-auto lists (autocomplete,
     location-browser option lists, member-name grid). Falls back to the
     browser default in engines that support neither API. */
  .slim-scroll { scrollbar-width: thin; scrollbar-color: rgb(168 162 158) transparent; }
  .slim-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
  .slim-scroll::-webkit-scrollbar-track { background: transparent; }
  .slim-scroll::-webkit-scrollbar-thumb { background-color: rgb(168 162 158); border-radius: 9999px; }
  .slim-scroll::-webkit-scrollbar-thumb:hover { background-color: rgb(120 113 108); }
  .dark .slim-scroll { scrollbar-color: rgb(64 64 64) transparent; }
  .dark .slim-scroll::-webkit-scrollbar-thumb { background-color: rgb(64 64 64); }
  .dark .slim-scroll::-webkit-scrollbar-thumb:hover { background-color: rgb(82 82 82); }

  /* Hide native number-input spinners so the custom +/- stepper is the only control. */
  .no-spinner[type="number"] { -moz-appearance: textfield; appearance: textfield; }
  .no-spinner[type="number"]::-webkit-outer-spin-button,
  .no-spinner[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
`;

// Wraps a whole screen so it fades/slides in on mount. Each of the three
// top-level screens (setup, WeeklyCollection, ResolutionLog) is a separate
// React return, so this always remounts on navigation and the animation
// replays every time — no key management needed.
function ScreenTransition({ children }) {
  return (
    <div style={{ animation: "screenIn 220ms ease-out both" }}>
      <style>{SCREEN_ANIM_CSS}</style>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-neutral-400 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

// Wraps the substring of `text` that matches `query` in an emphasized span.
// Case-insensitive, first match only (matches the `.includes()` filter above).
function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

function ToolCard({ icon: Icon, title, description, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={"w-full text-left bg-white dark:bg-neutral-950 rounded-xl border border-stone-200 dark:border-neutral-800 shadow-sm p-5 flex items-center gap-4 hover:border-emerald-600 dark:hover:border-emerald-500 hover:shadow-md transition-all disabled:hover:border-stone-200 dark:disabled:hover:border-neutral-800 disabled:hover:shadow-sm disabled:cursor-not-allowed " + focusRingClass}
    >
      <div
        className={
          "w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-colors " +
          (disabled
            ? "bg-stone-100 dark:bg-neutral-900 text-stone-300 dark:text-neutral-700"
            : "bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-500 dark:to-emerald-700 text-white shadow-inner shadow-emerald-900/40 dark:shadow-black/40 ring-1 ring-inset ring-white/10")
        }
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className={"font-semibold text-sm " + (disabled ? "text-stone-400 dark:text-neutral-600" : "text-stone-900 dark:text-stone-100")}>{title}</div>
        <div className={"text-xs mt-0.5 " + (disabled ? "text-stone-400 dark:text-neutral-700" : "text-stone-500 dark:text-neutral-400")}>{description}</div>
      </div>
      {disabled ? (
        <Lock className="w-4 h-4 text-stone-300 dark:text-neutral-700 shrink-0" />
      ) : (
        <ChevronRight className="w-4 h-4 text-stone-400 dark:text-neutral-600 shrink-0" />
      )}
    </button>
  );
}

const FLAT_SHG_LIST = flattenDirectory();

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [tool, setTool] = useState(null); // null | 'collection' | 'resolution'
  const [shgName, setShgName] = useState("");
  const [numMembers, setNumMembers] = useState(11);
  const [memberNames, setMemberNames] = useState([]);
  const [showNames, setShowNames] = useState(false);
  const [selectedPath, setSelectedPath] = useState(""); // set when picked from directory

  // --- search-as-you-type autocomplete on the name field ---
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeSuggestIndex, setActiveSuggestIndex] = useState(-1);
  const allMatches = useMemo(() => {
    const q = shgName.trim().toLowerCase();
    if (!q) return [];
    return FLAT_SHG_LIST.filter((g) => g.name.toLowerCase().includes(q));
  }, [shgName]);
  const allMatchCount = allMatches.length;
  const suggestions = useMemo(() => allMatches.slice(0, 8), [allMatches]);

  function pickGroup(group) {
    setShgName(group.name);
    setSelectedPath(group.path);
    setSuggestOpen(false);
    setActiveSuggestIndex(-1);
    setShowBrowse(false);

    // If a real member roster has been transcribed for this SHG, use it —
    // exact names, correct count, and reveal the (still fully editable)
    // names grid right away. Otherwise fall back to the manual-entry flow
    // exactly as before.
    const roster = findRosterByName(group.name);
    if (roster) {
      setNumMembers(roster.members.length);
      setMemberNames(roster.members.map((m) => m.name));
      setShowNames(true);
    } else {
      setNumMembers(group.members);
      setMemberNames([]);
    }
  }

  // Arrow-key/Enter/Escape navigation for the autocomplete listbox.
  function handleNameKeyDown(e) {
    if (!suggestOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestIndex((i) => Math.min(suggestions.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      if (activeSuggestIndex >= 0 && activeSuggestIndex < suggestions.length) {
        e.preventDefault();
        pickGroup(suggestions[activeSuggestIndex]);
      }
    } else if (e.key === "Escape") {
      setSuggestOpen(false);
      setActiveSuggestIndex(-1);
    }
  }

  // --- step-by-step location filter ---
  const [showBrowse, setShowBrowse] = useState(false);
  const [selState, setSelState] = useState("");
  const [selDistrict, setSelDistrict] = useState("");
  const [selBlock, setSelBlock] = useState("");
  const [selGP, setSelGP] = useState("");
  const [selVillage, setSelVillage] = useState("");

  const states = Object.keys(SHG_DIRECTORY);
  const districts = selState ? Object.keys(SHG_DIRECTORY[selState]) : [];
  const blocks = selDistrict ? Object.keys(SHG_DIRECTORY[selState][selDistrict]) : [];
  const gps = selBlock ? Object.keys(SHG_DIRECTORY[selState][selDistrict][selBlock]) : [];
  const villages = selGP ? Object.keys(SHG_DIRECTORY[selState][selDistrict][selBlock][selGP]) : [];
  const groups = selVillage ? SHG_DIRECTORY[selState][selDistrict][selBlock][selGP][selVillage] : [];

  // Ordered step definitions for the guided location browser below.
  const LOCATION_STEPS = [
    { label: "State", value: selState, options: states, onSelect: (v) => { setSelState(v); setSelDistrict(""); setSelBlock(""); setSelGP(""); setSelVillage(""); } },
    { label: "District", value: selDistrict, options: districts, onSelect: (v) => { setSelDistrict(v); setSelBlock(""); setSelGP(""); setSelVillage(""); } },
    { label: "Block", value: selBlock, options: blocks, onSelect: (v) => { setSelBlock(v); setSelGP(""); setSelVillage(""); } },
    { label: "Grampanchayat", value: selGP, options: gps, onSelect: (v) => { setSelGP(v); setSelVillage(""); } },
    { label: "Village", value: selVillage, options: villages, onSelect: (v) => setSelVillage(v) },
  ];
  const LEVEL_SETTERS = [setSelState, setSelDistrict, setSelBlock, setSelGP, setSelVillage];
  const firstUnsetIndex = LOCATION_STEPS.findIndex((s) => !s.value);
  const activeStepIndex = firstUnsetIndex === -1 ? LOCATION_STEPS.length : firstUnsetIndex;
  function resetFrom(i) {
    for (let j = i; j < LEVEL_SETTERS.length; j++) LEVEL_SETTERS[j]("");
  }

  const members = useMemo(
    () => Array.from({ length: numMembers }, (_, i) => memberNames[i]?.trim() || `Member ${i + 1}`),
    [numMembers, memberNames]
  );

  const ready = shgName.trim().length > 0 && numMembers > 0;

  function updateMemberName(i, val) {
    const next = [...memberNames];
    next[i] = val;
    setMemberNames(next);
  }

  if (tool === "collection") {
    return (
      <ScreenTransition>
        <WeeklyCollection shgName={shgName} members={members} onBackHome={() => setTool(null)} />
      </ScreenTransition>
    );
  }
  if (tool === "resolution") {
    return (
      <ScreenTransition>
        <ResolutionLog shgName={shgName} members={members} onBackHome={() => setTool(null)} />
      </ScreenTransition>
    );
  }
  if (tool === "idcard") {
    return (
      <ScreenTransition>
        <GroupIDCard shgName={shgName} members={members} location={selectedPath} onBackHome={() => setTool(null)} />
      </ScreenTransition>
    );
  }

  return (
    <ScreenTransition>
    <div className="min-h-screen bg-stone-100 dark:bg-black text-stone-900 dark:text-stone-100 font-sans">
      <div className="max-w-xl mx-auto px-4 py-10 sm:py-14">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase mb-2">SHG Register Tools</p>
            <h1 className="text-3xl font-serif font-semibold text-stone-900 dark:text-stone-100 leading-tight">Set up your group</h1>
            <p className="text-stone-600 dark:text-neutral-400 text-sm mt-2 leading-relaxed">
              Enter the group once, then pick a tool. Works for any SHG, any meeting day.
            </p>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>

        <div className="bg-white dark:bg-neutral-950 rounded-xl border border-stone-200 dark:border-neutral-800 shadow-sm p-5 sm:p-6 mb-6">
          <div className="space-y-5">
            <span className="block text-[11px] font-semibold uppercase tracking-widest text-emerald-700/80 dark:text-emerald-500/80">Identify the group</span>
          <div className="relative">
            <Field label="SHG Name">
              <div className="relative">
                <input
                  className={inputClass + " pl-8"}
                  placeholder="Type to search, e.g. KUSHI"
                  value={shgName}
                  role="combobox"
                  aria-expanded={suggestOpen && suggestions.length > 0}
                  aria-controls="shg-suggest-listbox"
                  aria-autocomplete="list"
                  aria-activedescendant={activeSuggestIndex >= 0 ? `shg-suggest-option-${activeSuggestIndex}` : undefined}
                  onChange={(e) => {
                    setShgName(e.target.value);
                    setSelectedPath("");
                    setSuggestOpen(true);
                    setActiveSuggestIndex(-1);
                  }}
                  onFocus={() => setSuggestOpen(true)}
                  onBlur={() => setTimeout(() => { setSuggestOpen(false); setActiveSuggestIndex(-1); }, 150)}
                  onKeyDown={handleNameKeyDown}
                />
                <Search className="w-4 h-4 text-stone-400 dark:text-neutral-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </Field>

            {suggestOpen && suggestions.length > 0 && (
              <div
                key={shgName.trim().toLowerCase() ? "open" : "closed"}
                className="absolute z-10 mt-1 w-full bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-700 rounded-md shadow-lg max-h-64 overflow-hidden origin-top"
                style={{ animation: "suggestIn 120ms ease-out" }}
              >
                <div className="px-3 py-1.5 text-[11px] font-medium text-stone-400 dark:text-neutral-500 border-b border-stone-100 dark:border-neutral-800 bg-stone-50/60 dark:bg-neutral-950/40">
                  {allMatchCount} {allMatchCount === 1 ? "match" : "matches"}{allMatchCount > suggestions.length ? ` · showing top ${suggestions.length}` : ""}
                </div>
                <div id="shg-suggest-listbox" role="listbox" className="max-h-56 overflow-y-auto slim-scroll">
                  {suggestions.map((g, i) => (
                    <button
                      key={i}
                      id={`shg-suggest-option-${i}`}
                      role="option"
                      aria-selected={i === activeSuggestIndex}
                      tabIndex={-1}
                      type="button"
                      onMouseDown={() => pickGroup(g)}
                      onMouseEnter={() => setActiveSuggestIndex(i)}
                      className={
                        "w-full text-left px-3 py-2 border-b border-stone-100 dark:border-neutral-800 last:border-0 " +
                        (i === activeSuggestIndex ? "bg-stone-50 dark:bg-neutral-800" : "hover:bg-stone-50 dark:hover:bg-neutral-800")
                      }
                    >
                      <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                        {highlightMatch(g.name, shgName.trim())} <span className="text-stone-400 dark:text-neutral-500 font-normal">({g.members} members)</span>
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-neutral-500">{g.path}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedPath && (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {selectedPath}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowBrowse((v) => !v)}
            className={"text-sm text-emerald-700 dark:text-emerald-400 font-medium hover:text-emerald-800 dark:hover:text-emerald-300 inline-flex items-center gap-1 rounded-md " + focusRingClass}
          >
            <MapPin className="w-3.5 h-3.5" /> {showBrowse ? "Hide location filter" : "Or find it step-by-step by location"}
          </button>

          {showBrowse && (
            <div className="rounded-lg border border-stone-200 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-900 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-neutral-400">Browse by location</span>
                <button type="button" onClick={() => setShowBrowse(false)} aria-label="Close location browser" className={"text-stone-400 dark:text-neutral-500 hover:text-stone-600 dark:hover:text-neutral-300 rounded " + focusRingClass}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Progress stepper: one segment per level, filled as you go */}
              <div className="flex items-center gap-1.5">
                {LOCATION_STEPS.map((step, i) => (
                  <div
                    key={step.label}
                    className={
                      "h-1.5 flex-1 rounded-full transition-colors duration-300 " +
                      (i < activeStepIndex
                        ? "bg-emerald-600 dark:bg-emerald-500"
                        : i === activeStepIndex
                        ? "bg-emerald-300 dark:bg-emerald-800"
                        : "bg-stone-200 dark:bg-neutral-800")
                    }
                    title={step.label}
                  />
                ))}
              </div>

              {/* Breadcrumb of confirmed selections — tap one to jump back and re-pick from there */}
              {activeStepIndex > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {LOCATION_STEPS.slice(0, activeStepIndex).map((step, i) => (
                    <button
                      key={step.label}
                      type="button"
                      onClick={() => resetFrom(i)}
                      className={"inline-flex items-center gap-1 text-xs font-medium bg-white dark:bg-neutral-950 border border-stone-300 dark:border-neutral-700 text-stone-700 dark:text-stone-300 rounded-full pl-2.5 pr-1.5 py-1 hover:border-emerald-600 dark:hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 " + focusRingClass}
                    >
                      {step.value}
                      <X className="w-3 h-3 text-stone-400 dark:text-neutral-500" />
                    </button>
                  ))}
                </div>
              )}

              {/* Active step: tappable list of options for the next level */}
              {activeStepIndex < LOCATION_STEPS.length && (() => {
                const step = LOCATION_STEPS[activeStepIndex];
                if (step.options.length === 0) {
                  const prevLabel = LOCATION_STEPS[activeStepIndex - 1]?.value ?? "this selection";
                  return (
                    <p className="text-xs text-stone-500 dark:text-neutral-500">
                      No {step.label.toLowerCase()} data for {prevLabel} yet — type the SHG name manually instead.
                    </p>
                  );
                }
                return (
                  <div key={step.label} style={{ animation: "suggestIn 140ms ease-out" }}>
                    <span className="block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-neutral-400 mb-1.5">
                      Select {step.label}
                    </span>
                    <div className="max-h-56 overflow-y-auto slim-scroll space-y-1 pr-1">
                      {step.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => step.onSelect(opt)}
                          className={"w-full text-left px-3 py-2 rounded-md bg-white dark:bg-neutral-950 border border-stone-200 dark:border-neutral-800 hover:border-emerald-600 dark:hover:border-emerald-500 text-sm text-stone-800 dark:text-stone-200 " + focusRingClass}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* All five levels picked — show the SHGs at that village */}
              {activeStepIndex === LOCATION_STEPS.length && (
                groups.length > 0 ? (
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-neutral-400 mb-1.5">
                      {groups.length} SHGs in {selVillage}
                    </span>
                    <div className="max-h-56 overflow-y-auto slim-scroll space-y-1 pr-1">
                      {groups.map(([name, count], i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => pickGroup({ name, members: count, path: `${selState}, ${selDistrict}, ${selBlock}, ${selGP}, ${selVillage}` })}
                          className={"w-full text-left px-3 py-2 rounded-md bg-white dark:bg-neutral-950 border border-stone-200 dark:border-neutral-800 hover:border-emerald-600 dark:hover:border-emerald-500 text-sm flex items-center justify-between " + focusRingClass}
                        >
                          <span className="text-stone-800 dark:text-stone-200">{name}</span>
                          <span className="text-stone-400 dark:text-neutral-500 text-xs">{count} members</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 dark:text-neutral-500">No SHGs listed for {selVillage} yet — type the SHG name manually instead.</p>
                )
              )}
            </div>
          )}

          </div>

          <div className="mt-6 pt-5 border-t border-stone-100 dark:border-neutral-900 space-y-5">
            <span className="block text-[11px] font-semibold uppercase tracking-widest text-emerald-700/80 dark:text-emerald-500/80">Group size</span>
            <Field label="Number of Members">
              <div className="flex items-stretch rounded-md border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600 dark:focus-within:ring-emerald-500 focus-within:border-emerald-600 dark:focus-within:border-emerald-500">
                <button
                  type="button"
                  aria-label="Decrease member count"
                  disabled={numMembers <= 1}
                  onClick={() => { setNumMembers((n) => Math.max(1, n - 1)); setSelectedPath(""); }}
                  className={"px-3.5 text-stone-500 dark:text-neutral-400 hover:bg-stone-50 dark:hover:bg-neutral-900 border-r border-stone-200 dark:border-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent " + focusRingClass}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={30}
                  className="no-spinner w-full text-center bg-transparent px-2 py-2 text-sm text-stone-900 dark:text-stone-100 focus:outline-none"
                  value={numMembers}
                  onChange={(e) => { setNumMembers(Math.min(30, Math.max(1, Number(e.target.value) || 1))); setSelectedPath(""); }}
                />
                <button
                  type="button"
                  aria-label="Increase member count"
                  disabled={numMembers >= 30}
                  onClick={() => { setNumMembers((n) => Math.min(30, n + 1)); setSelectedPath(""); }}
                  className={"px-3.5 text-stone-500 dark:text-neutral-400 hover:bg-stone-50 dark:hover:bg-neutral-900 border-l border-stone-200 dark:border-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent " + focusRingClass}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </Field>

            <div>
              <button type="button" onClick={() => setShowNames((v) => !v)} className={"text-sm text-emerald-700 dark:text-emerald-400 font-medium hover:text-emerald-800 dark:hover:text-emerald-300 rounded-md " + focusRingClass}>
                {showNames ? "Hide member names" : "Add member names (optional)"}
              </button>
              {showNames && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto slim-scroll pr-1">
                  {Array.from({ length: numMembers }).map((_, i) => (
                    <input
                      key={i}
                      className={inputClass}
                      placeholder={`Member ${i + 1}`}
                      value={memberNames[i] || ""}
                      onChange={(e) => updateMemberName(i, e.target.value)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <ToolCard
            icon={Wallet}
            title="Weekly Collection Report"
            description="Auto-calculate every meeting date and running savings total"
            disabled={!ready}
            onClick={() => setTool("collection")}
          />
          <ToolCard
            icon={FileText}
            title="Meeting Resolution Log"
            description="Auto-rotate meeting dates and the chairing member; you write the resolution"
            disabled={!ready}
            onClick={() => setTool("resolution")}
          />
          <ToolCard
            icon={CreditCard}
            title="Group ID Card"
            description="A printable, official-style summary with the member roster and a QR reference"
            disabled={!ready}
            onClick={() => setTool("idcard")}
          />
        </div>

        {!ready && <p className="text-xs text-stone-400 dark:text-neutral-600 mt-3 text-center">Enter the SHG name and member count to continue.</p>}
      </div>
    </div>
    </ScreenTransition>
  );
}
