import { useMemo, useState } from "react";
import { Wallet, FileText, ChevronRight, Search, MapPin, X } from "lucide-react";
import WeeklyCollection from "./tools/WeeklyCollection.jsx";
import ResolutionLog from "./tools/ResolutionLog.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import { useTheme } from "./lib/theme.js";
import { SHG_DIRECTORY, flattenDirectory } from "./lib/shgDirectory.js";

const inputClass =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-stone-100 dark:focus:ring-emerald-500 dark:focus:border-emerald-500 dark:placeholder:text-neutral-600";

const selectClass = inputClass + " disabled:opacity-40 disabled:cursor-not-allowed";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-neutral-400 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function ToolCard({ icon: Icon, title, description, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-neutral-950 rounded-xl border border-stone-200 dark:border-neutral-800 shadow-sm p-5 flex items-center gap-4 hover:border-emerald-600 dark:hover:border-emerald-500 hover:shadow-md transition-all disabled:opacity-40 disabled:hover:border-stone-200 dark:disabled:hover:border-neutral-800 disabled:hover:shadow-sm disabled:cursor-not-allowed"
    >
      <div className="w-11 h-11 rounded-lg bg-emerald-700 dark:bg-emerald-600 text-white flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{title}</div>
        <div className="text-xs text-stone-500 dark:text-neutral-400 mt-0.5">{description}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-stone-400 dark:text-neutral-600 shrink-0" />
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
  const suggestions = useMemo(() => {
    const q = shgName.trim().toLowerCase();
    if (!q) return [];
    return FLAT_SHG_LIST.filter((g) => g.name.toLowerCase().includes(q)).slice(0, 8);
  }, [shgName]);

  function pickGroup(group) {
    setShgName(group.name);
    setNumMembers(group.members);
    setMemberNames([]);
    setSelectedPath(group.path);
    setSuggestOpen(false);
    setShowBrowse(false);
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
    return <WeeklyCollection shgName={shgName} members={members} onBackHome={() => setTool(null)} />;
  }
  if (tool === "resolution") {
    return <ResolutionLog shgName={shgName} members={members} onBackHome={() => setTool(null)} />;
  }

  return (
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

        <div className="bg-white dark:bg-neutral-950 rounded-xl border border-stone-200 dark:border-neutral-800 shadow-sm p-5 sm:p-6 space-y-5 mb-6">
          <div className="relative">
            <Field label="SHG Name">
              <div className="relative">
                <input
                  className={inputClass + " pl-8"}
                  placeholder="Type to search, e.g. KUSHI"
                  value={shgName}
                  onChange={(e) => {
                    setShgName(e.target.value);
                    setSelectedPath("");
                    setSuggestOpen(true);
                  }}
                  onFocus={() => setSuggestOpen(true)}
                  onBlur={() => setTimeout(() => setSuggestOpen(false), 150)}
                />
                <Search className="w-4 h-4 text-stone-400 dark:text-neutral-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </Field>

            {suggestOpen && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-700 rounded-md shadow-lg max-h-56 overflow-y-auto">
                {suggestions.map((g, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={() => pickGroup(g)}
                    className="w-full text-left px-3 py-2 hover:bg-stone-50 dark:hover:bg-neutral-800 border-b border-stone-100 dark:border-neutral-800 last:border-0"
                  >
                    <div className="text-sm font-medium text-stone-900 dark:text-stone-100">{g.name} <span className="text-stone-400 dark:text-neutral-500 font-normal">({g.members} members)</span></div>
                    <div className="text-[11px] text-stone-500 dark:text-neutral-500">{g.path}</div>
                  </button>
                ))}
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
            className="text-sm text-emerald-700 dark:text-emerald-400 font-medium hover:text-emerald-800 dark:hover:text-emerald-300 inline-flex items-center gap-1"
          >
            <MapPin className="w-3.5 h-3.5" /> {showBrowse ? "Hide location filter" : "Or find it step-by-step by location"}
          </button>

          {showBrowse && (
            <div className="rounded-lg border border-stone-200 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-900 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-neutral-400">Browse by location</span>
                <button type="button" onClick={() => setShowBrowse(false)} className="text-stone-400 dark:text-neutral-500 hover:text-stone-600 dark:hover:text-neutral-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Field label="State">
                  <select className={selectClass} value={selState} onChange={(e) => { setSelState(e.target.value); setSelDistrict(""); setSelBlock(""); setSelGP(""); setSelVillage(""); }}>
                    <option value="">Select...</option>
                    {states.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="District">
                  <select className={selectClass} disabled={!selState} value={selDistrict} onChange={(e) => { setSelDistrict(e.target.value); setSelBlock(""); setSelGP(""); setSelVillage(""); }}>
                    <option value="">Select...</option>
                    {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Block">
                  <select className={selectClass} disabled={!selDistrict} value={selBlock} onChange={(e) => { setSelBlock(e.target.value); setSelGP(""); setSelVillage(""); }}>
                    <option value="">Select...</option>
                    {blocks.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>
                <Field label="Grampanchayat">
                  <select className={selectClass} disabled={!selBlock} value={selGP} onChange={(e) => { setSelGP(e.target.value); setSelVillage(""); }}>
                    <option value="">Select...</option>
                    {gps.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="Village">
                  <select className={selectClass} disabled={!selGP} value={selVillage} onChange={(e) => setSelVillage(e.target.value)}>
                    <option value="">Select...</option>
                    {villages.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </Field>
              </div>

              {selBlock && gps.length === 0 && (
                <p className="text-xs text-stone-500 dark:text-neutral-500">No Grampanchayat data for {selBlock} yet — type the SHG name manually instead.</p>
              )}
              {selGP && villages.length === 0 && (
                <p className="text-xs text-stone-500 dark:text-neutral-500">No village data for {selGP} yet — type the SHG name manually instead.</p>
              )}

              {selVillage && groups.length > 0 && (
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-neutral-400 mb-1.5">
                    {groups.length} SHGs in {selVillage}
                  </span>
                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                    {groups.map(([name, count], i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => pickGroup({ name, members: count, path: `${selState}, ${selDistrict}, ${selBlock}, ${selGP}, ${selVillage}` })}
                        className="w-full text-left px-3 py-2 rounded-md bg-white dark:bg-neutral-950 border border-stone-200 dark:border-neutral-800 hover:border-emerald-600 dark:hover:border-emerald-500 text-sm flex items-center justify-between"
                      >
                        <span className="text-stone-800 dark:text-stone-200">{name}</span>
                        <span className="text-stone-400 dark:text-neutral-500 text-xs">{count} members</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Field label="Number of Members">
            <input
              type="number"
              min={1}
              max={30}
              className={inputClass}
              value={numMembers}
              onChange={(e) => { setNumMembers(Math.max(1, Number(e.target.value) || 1)); setSelectedPath(""); }}
            />
          </Field>

          <div>
            <button type="button" onClick={() => setShowNames((v) => !v)} className="text-sm text-emerald-700 dark:text-emerald-400 font-medium hover:text-emerald-800 dark:hover:text-emerald-300">
              {showNames ? "Hide member names" : "Add member names (optional)"}
            </button>
            {showNames && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
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
        </div>

        {!ready && <p className="text-xs text-stone-400 dark:text-neutral-600 mt-3 text-center">Enter the SHG name and member count to continue.</p>}
      </div>
    </div>
  );
}
