import { useMemo, useState } from "react";
import { Wallet, FileText, ChevronRight } from "lucide-react";
import WeeklyCollection from "./tools/WeeklyCollection.jsx";
import ResolutionLog from "./tools/ResolutionLog.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import { useTheme } from "./lib/theme.js";

const inputClass =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-stone-100 dark:focus:ring-emerald-500 dark:focus:border-emerald-500 dark:placeholder:text-neutral-600";

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

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [tool, setTool] = useState(null); // null | 'collection' | 'resolution'
  const [shgName, setShgName] = useState("");
  const [numMembers, setNumMembers] = useState(11);
  const [memberNames, setMemberNames] = useState([]);
  const [showNames, setShowNames] = useState(false);

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
          <Field label="SHG Name">
            <input
              className={inputClass}
              placeholder="e.g. KUSHI SHG"
              value={shgName}
              onChange={(e) => setShgName(e.target.value)}
            />
          </Field>

          <Field label="Number of Members">
            <input
              type="number"
              min={1}
              max={30}
              className={inputClass}
              value={numMembers}
              onChange={(e) => setNumMembers(Math.max(1, Number(e.target.value) || 1))}
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
