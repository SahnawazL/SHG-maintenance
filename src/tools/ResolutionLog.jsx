import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";
import { WEEKDAYS, MONTHS, YEARS, formatDate, computeMeetingDates } from "../lib/dates.js";

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

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function ResolutionLog({ shgName, members, onBackHome }) {
  const [stage, setStage] = useState("setup");
  const [weekday, setWeekday] = useState(0);
  const [startMonth, setStartMonth] = useState(2);
  const [startYear, setStartYear] = useState(2025);
  const [endMonth, setEndMonth] = useState(6);
  const [endYear, setEndYear] = useState(2026);
  const [entries, setEntries] = useState([]);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const startAfterEnd = startYear > endYear || (startYear === endYear && startMonth > endMonth);

  function handleGenerate() {
    if (startAfterEnd) return;
    const dates = computeMeetingDates({ startYear, startMonth, endYear, endMonth, weekday });

    // Group by month so the serial number (1st, 2nd, 3rd...) resets each month,
    // matching how the paper resolution copy numbers meetings.
    let monthKey = null;
    let serial = 0;
    const built = dates.map((date, i) => {
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (key !== monthKey) {
        monthKey = key;
        serial = 0;
      }
      serial += 1;
      return {
        date,
        serial,
        host: members[i % members.length],
        note: "",
      };
    });

    setEntries(built);
    setActive(0);
    setStage("report");
  }

  function updateNote(val) {
    setEntries((prev) => prev.map((e, i) => (i === active ? { ...e, note: val } : e)));
  }

  function meetingText(e) {
    return [
      `${shgName}`,
      `${ordinal(e.serial)} meeting — ${formatDate(e.date)} (${WEEKDAYS[e.date.getDay()]})`,
      `Chaired by: ${e.host}`,
      "",
      e.note || "(no resolution written yet)",
    ].join("\n");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(meetingText(entries[active]));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available — ignore silently
    }
  }

  if (stage === "setup") {
    return (
      <div className="min-h-screen bg-stone-100 dark:bg-black">
        <div className="max-w-xl mx-auto px-4 py-8 sm:py-10">
          <button type="button" onClick={onBackHome} className="inline-flex items-center gap-1.5 text-sm text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-stone-100 mb-5">
            <ArrowLeft className="w-4 h-4" /> Back to tools
          </button>

          <p className="text-xs font-semibold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase mb-2">{shgName}</p>
          <h1 className="text-2xl font-serif font-semibold text-stone-900 dark:text-stone-100 leading-tight mb-1">Meeting Resolution Log</h1>
          <p className="text-stone-600 dark:text-neutral-400 text-sm mb-6">
            Meeting dates and the chairing member rotate automatically. You write the resolution for each meeting.
          </p>

          <div className="bg-white dark:bg-neutral-950 rounded-xl border border-stone-200 dark:border-neutral-800 shadow-sm p-5 sm:p-6 space-y-5">
            <Field label="Meeting Day">
              <select className={inputClass} value={weekday} onChange={(e) => setWeekday(Number(e.target.value))}>
                {WEEKDAYS.map((w, i) => (
                  <option key={w} value={i}>Every {w}</option>
                ))}
              </select>
            </Field>

            <div>
              <span className="block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-neutral-400 mb-1.5">Start Month</span>
              <div className="grid grid-cols-2 gap-3">
                <select className={inputClass} value={startMonth} onChange={(e) => setStartMonth(Number(e.target.value))}>
                  {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
                <select className={inputClass} value={startYear} onChange={(e) => setStartYear(Number(e.target.value))}>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-neutral-400 mb-1.5">End Month</span>
              <div className="grid grid-cols-2 gap-3">
                <select className={inputClass} value={endMonth} onChange={(e) => setEndMonth(Number(e.target.value))}>
                  {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
                <select className={inputClass} value={endYear} onChange={(e) => setEndYear(Number(e.target.value))}>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {startAfterEnd && <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">End month must be after start month.</p>}
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={startAfterEnd}
              className="w-full rounded-md bg-emerald-700 dark:bg-emerald-600 text-white font-semibold py-2.5 text-sm hover:bg-emerald-800 dark:hover:bg-emerald-500 disabled:bg-stone-300 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed transition-colors"
            >
              Generate Meeting List
            </button>
          </div>
        </div>
      </div>
    );
  }

  const e = entries[active];

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-black">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        <button type="button" onClick={() => setStage("setup")} className="inline-flex items-center gap-1.5 text-sm text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-stone-100 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to setup
        </button>

        <div className="bg-white dark:bg-neutral-950 rounded-xl border border-stone-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="bg-emerald-700 dark:bg-emerald-800 text-white px-5 py-5 sm:px-7 sm:py-6">
            <p className="text-xs uppercase tracking-widest text-emerald-100 dark:text-emerald-200 mb-1">Meeting Resolution Log</p>
            <h1 className="text-2xl font-serif font-semibold">{shgName}</h1>
            <p className="text-xs text-emerald-100 dark:text-emerald-200 mt-2">{entries.length} meetings · {MONTHS[startMonth]} {startYear} → {MONTHS[endMonth]} {endYear}</p>
          </div>

          <div className="flex items-center gap-2 px-5 sm:px-7 py-3 bg-stone-50 dark:bg-neutral-900 border-b border-stone-200 dark:border-neutral-800">
            <button type="button" onClick={() => setActive((i) => Math.max(0, i - 1))} disabled={active === 0} className="p-1.5 rounded-md border border-stone-300 dark:border-neutral-700 disabled:opacity-30 hover:bg-white dark:hover:bg-neutral-800">
              <ChevronLeft className="w-4 h-4 dark:text-stone-300" />
            </button>
            <div className="flex-1 text-center">
              <span className="text-xs text-stone-500 dark:text-neutral-400">Meeting {active + 1} of {entries.length}</span>
              <div className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{formatDate(e.date)} · {WEEKDAYS[e.date.getDay()]}</div>
            </div>
            <button type="button" onClick={() => setActive((i) => Math.min(entries.length - 1, i + 1))} disabled={active === entries.length - 1} className="p-1.5 rounded-md border border-stone-300 dark:border-neutral-700 disabled:opacity-30 hover:bg-white dark:hover:bg-neutral-800">
              <ChevronRight className="w-4 h-4 dark:text-stone-300" />
            </button>
          </div>

          <div className="px-5 sm:px-7 py-5 space-y-4">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-stone-700 dark:text-neutral-300">
              <span><span className="text-stone-400 dark:text-neutral-500">Serial:</span> {ordinal(e.serial)} meeting this month</span>
              <span><span className="text-stone-400 dark:text-neutral-500">Chaired by:</span> <span className="font-semibold text-stone-900 dark:text-stone-100">{e.host}</span></span>
            </div>

            <div>
              <span className="block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-neutral-400 mb-1.5">Resolution / discussion</span>
              <textarea
                className={inputClass + " min-h-[140px]"}
                placeholder="Type what was discussed and decided in this meeting..."
                value={e.note}
                onChange={(ev) => updateNote(ev.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 dark:border-neutral-700 px-3 py-2 text-sm text-stone-700 dark:text-neutral-300 hover:bg-stone-50 dark:hover:bg-neutral-900"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy this meeting's entry"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
