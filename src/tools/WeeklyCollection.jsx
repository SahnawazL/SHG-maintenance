import { useState } from "react";
import { ChevronLeft, ChevronRight, Users, Calendar, Wallet, ArrowLeft } from "lucide-react";
import { WEEKDAYS, MONTHS, YEARS, formatDate, formatRupee, computeMeetingDates, groupWithRunningTotal } from "../lib/dates.js";

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

export default function WeeklyCollection({ shgName, members, onBackHome }) {
  const [stage, setStage] = useState("setup");
  const [weekday, setWeekday] = useState(2);
  const [weeklyAmount, setWeeklyAmount] = useState(20);
  const [startMonth, setStartMonth] = useState(9);
  const [startYear, setStartYear] = useState(2023);
  const [endMonth, setEndMonth] = useState(6);
  const [endYear, setEndYear] = useState(2026);
  const [report, setReport] = useState(null);
  const [activeMember, setActiveMember] = useState(0);
  const [activeMonth, setActiveMonth] = useState(0);
  const [viewMode, setViewMode] = useState("compact"); // 'compact' | 'all'

  const startAfterEnd = startYear > endYear || (startYear === endYear && startMonth > endMonth);
  const canGenerate = weeklyAmount > 0 && !startAfterEnd;

  function handleGenerate() {
    if (!canGenerate) return;
    const dates = computeMeetingDates({ startYear, startMonth, endYear, endMonth, weekday });
    const grouped = groupWithRunningTotal(dates, Number(weeklyAmount));
    setReport({ ...grouped, totalGroup: grouped.totalPerMember * members.length });
    setActiveMember(0);
    setActiveMonth(0);
    setStage("report");
  }

  if (stage === "setup") {
    return (
      <div className="min-h-screen bg-stone-100 dark:bg-black">
        <div className="max-w-xl mx-auto px-4 py-8 sm:py-10">
          <button type="button" onClick={onBackHome} className="inline-flex items-center gap-1.5 text-sm text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-stone-100 mb-5">
            <ArrowLeft className="w-4 h-4" /> Back to tools
          </button>

          <p className="text-xs font-semibold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase mb-2">{shgName}</p>
          <h1 className="text-2xl font-serif font-semibold text-stone-900 dark:text-stone-100 leading-tight mb-1">Weekly Collection Report</h1>
          <p className="text-stone-600 dark:text-neutral-400 text-sm mb-6">Every meeting date, weekday and running total, calculated automatically.</p>

          <div className="bg-white dark:bg-neutral-950 rounded-xl border border-stone-200 dark:border-neutral-800 shadow-sm p-5 sm:p-6 space-y-5">
            <Field label="Weekly Collection (₹ per member)">
              <input
                type="number"
                min={1}
                className={inputClass}
                value={weeklyAmount}
                onChange={(e) => setWeeklyAmount(Math.max(0, Number(e.target.value) || 0))}
              />
            </Field>

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
              disabled={!canGenerate}
              onClick={handleGenerate}
              className="w-full rounded-md bg-emerald-700 dark:bg-emerald-600 text-white font-semibold py-2.5 text-sm hover:bg-emerald-800 dark:hover:bg-emerald-500 disabled:bg-stone-300 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed transition-colors"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  const now = new Date();
  const todayMonthIndex = report.months.findIndex((mo) => mo.year === now.getFullYear() && mo.month === now.getMonth());

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-black">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
        <button type="button" onClick={() => setStage("setup")} className="inline-flex items-center gap-1.5 text-sm text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-stone-100 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to setup
        </button>

        <div className="bg-white dark:bg-neutral-950 rounded-xl border border-stone-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="bg-emerald-700 dark:bg-emerald-800 text-white px-5 py-5 sm:px-7 sm:py-6">
            <p className="text-xs uppercase tracking-widest text-emerald-100 dark:text-emerald-200 mb-1">Weekly Collection Register</p>
            <h1 className="text-2xl font-serif font-semibold">{shgName}</h1>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-sm text-emerald-50 dark:text-emerald-100">
              <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Every {WEEKDAYS[weekday]}</span>
              <span className="inline-flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> {formatRupee(weeklyAmount)} / member / week</span>
              <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {members.length} members</span>
            </div>
            <p className="text-xs text-emerald-100 dark:text-emerald-200 mt-2">{MONTHS[startMonth]} {startYear} → {MONTHS[endMonth]} {endYear}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-stone-200 dark:divide-neutral-800 border-b border-stone-200 dark:border-neutral-800">
            {[
              ["Total Meetings", report.totalMeetings],
              ["Months Covered", report.totalMonths],
              ["Per-Member Total", formatRupee(report.totalPerMember)],
              ["Group Total", formatRupee(report.totalGroup)],
            ].map(([label, val]) => (
              <div key={label} className="px-4 py-3 text-center">
                <div className="text-lg font-mono font-semibold text-stone-900 dark:text-stone-100">{val}</div>
                <div className="text-[11px] text-stone-500 dark:text-neutral-500 uppercase tracking-wide mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 px-5 sm:px-7 py-3 bg-stone-50 dark:bg-neutral-900 border-b border-stone-200 dark:border-neutral-800">
            <button type="button" onClick={() => setActiveMember((i) => Math.max(0, i - 1))} disabled={activeMember === 0} className="p-1.5 rounded-md border border-stone-300 dark:border-neutral-700 disabled:opacity-30 hover:bg-white dark:hover:bg-neutral-800">
              <ChevronLeft className="w-4 h-4 dark:text-stone-300" />
            </button>
            <div className="flex-1 text-center">
              <span className="text-xs text-stone-500 dark:text-neutral-400">Copy page for</span>
              <select
                value={activeMember}
                onChange={(e) => setActiveMember(Number(e.target.value))}
                className="block mx-auto font-semibold text-stone-900 dark:text-stone-100 text-sm bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:focus:ring-emerald-500 rounded-md cursor-pointer"
              >
                {members.map((name, i) => (
                  <option key={i} value={i} className="text-stone-900 dark:text-stone-100">
                    {name} ({i + 1} of {members.length})
                  </option>
                ))}
              </select>
            </div>
            <button type="button" onClick={() => setActiveMember((i) => Math.min(members.length - 1, i + 1))} disabled={activeMember === members.length - 1} className="p-1.5 rounded-md border border-stone-300 dark:border-neutral-700 disabled:opacity-30 hover:bg-white dark:hover:bg-neutral-800">
              <ChevronRight className="w-4 h-4 dark:text-stone-300" />
            </button>
          </div>
          <p className="text-center text-xs text-stone-500 dark:text-neutral-500 px-5 pt-3">
            Dates, weekday and running totals below are identical for every member — only the name changes. Write this same table into each member's page.
          </p>

          <div className="flex items-center justify-between gap-2 px-5 sm:px-7 py-3 border-b border-stone-200 dark:border-neutral-800">
            <div className="inline-flex rounded-md border border-stone-300 dark:border-neutral-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode("compact")}
                className={`px-3 py-1.5 text-xs font-semibold ${viewMode === "compact" ? "bg-emerald-700 dark:bg-emerald-600 text-white" : "bg-white dark:bg-neutral-950 text-stone-600 dark:text-neutral-400 hover:bg-stone-50 dark:hover:bg-neutral-900"}`}
              >
                Compact (one month)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("all")}
                className={`px-3 py-1.5 text-xs font-semibold border-l border-stone-300 dark:border-neutral-700 ${viewMode === "all" ? "bg-emerald-700 dark:bg-emerald-600 text-white" : "bg-white dark:bg-neutral-950 text-stone-600 dark:text-neutral-400 hover:bg-stone-50 dark:hover:bg-neutral-900"}`}
              >
                All months
              </button>
            </div>

            {viewMode === "compact" && (
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => setActiveMonth((i) => Math.max(0, i - 1))} disabled={activeMonth === 0} className="p-1.5 rounded-md border border-stone-300 dark:border-neutral-700 disabled:opacity-30 hover:bg-stone-50 dark:hover:bg-neutral-900">
                  <ChevronLeft className="w-4 h-4 dark:text-stone-300" />
                </button>
                <select
                  value={activeMonth}
                  onChange={(e) => setActiveMonth(Number(e.target.value))}
                  className="text-xs font-semibold text-stone-700 dark:text-stone-300 bg-white dark:bg-neutral-950 border border-stone-300 dark:border-neutral-700 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:focus:ring-emerald-500 cursor-pointer"
                >
                  {report.months.map((mo, i) => (
                    <option key={mo.key} value={i}>{MONTHS[mo.month]} {mo.year}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setActiveMonth((i) => Math.min(report.months.length - 1, i + 1))} disabled={activeMonth === report.months.length - 1} className="p-1.5 rounded-md border border-stone-300 dark:border-neutral-700 disabled:opacity-30 hover:bg-stone-50 dark:hover:bg-neutral-900">
                  <ChevronRight className="w-4 h-4 dark:text-stone-300" />
                </button>
                {todayMonthIndex !== -1 && activeMonth !== todayMonthIndex && (
                  <button
                    type="button"
                    onClick={() => setActiveMonth(todayMonthIndex)}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-600 dark:border-emerald-500 rounded-md px-2 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                  >
                    Today
                  </button>
                )}
              </div>
            )}
          </div>

          {viewMode === "compact" ? (
            <div className="px-4 sm:px-7 py-5">
              {(() => {
                const m = report.months[activeMonth];
                return (
                  <div className="border border-stone-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                    <div className="bg-stone-100 dark:bg-neutral-900 px-4 py-2.5 flex items-center justify-between border-b border-stone-200 dark:border-neutral-800">
                      <span className="font-serif font-semibold text-stone-800 dark:text-stone-200">{MONTHS[m.month]} {m.year}</span>
                      <span className="text-xs font-mono text-stone-600 dark:text-neutral-400">Month total: {formatRupee(m.monthTotal)}</span>
                    </div>
                    {/* Mobile: compact card list, no horizontal cutoff */}
                    <div className="sm:hidden divide-y divide-stone-100 dark:divide-neutral-900">
                      {m.rows.map((row, i) => (
                        <div key={i} className={`px-4 py-3 ${i % 2 === 1 ? "bg-stone-50 dark:bg-neutral-900/60" : ""}`}>
                          {i === 0 && (
                            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-neutral-400 mb-1.5">
                              <span className="font-semibold text-stone-700 dark:text-stone-300">{members[activeMember]}</span>
                              <span>Last month: <span className="font-mono">{formatRupee(m.carryIn)}</span></span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm text-stone-900 dark:text-stone-100">{formatDate(row.date)}</span>
                            <span className="font-mono text-base font-semibold text-amber-700 dark:text-amber-400">{formatRupee(row.running)}</span>
                          </div>
                          <div className="text-xs text-stone-500 dark:text-neutral-400 mt-0.5">
                            Weekly savings: <span className="font-mono text-stone-700 dark:text-neutral-300">{formatRupee(row.amount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop / tablet: full table */}
                    <table className="w-full text-base hidden sm:table">
                      <thead>
                        <tr className="text-stone-500 dark:text-neutral-400 text-xs uppercase tracking-wide">
                          <th className="px-3 py-3 text-left font-medium">Date</th>
                          <th className="px-3 py-3 text-left font-medium">Member Name</th>
                          <th className="px-3 py-3 text-left font-medium">Cash Book Pg No.</th>
                          <th className="px-3 py-3 text-right font-medium">Total up to Last Month</th>
                          <th className="px-3 py-3 text-right font-medium">Weekly Savings</th>
                          <th className="px-3 py-3 text-right font-medium">Running Total</th>
                          <th className="px-3 py-3 text-left font-medium">Signature</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-neutral-900">
                        {m.rows.map((row, i) => (
                          <tr key={i} className={i % 2 === 1 ? "bg-stone-50 dark:bg-neutral-900/60" : ""}>
                            <td className="px-3 py-4 font-mono text-stone-900 dark:text-stone-100">{formatDate(row.date)}</td>
                            <td className="px-3 py-4 text-stone-800 dark:text-stone-200">{i === 0 ? members[activeMember] : ""}</td>
                            <td className="px-3 py-4 text-stone-300 dark:text-neutral-700">{/* blank — fill by hand */}</td>
                            <td className="px-3 py-4 font-mono text-right text-stone-700 dark:text-neutral-300">{i === 0 ? formatRupee(m.carryIn) : ""}</td>
                            <td className="px-3 py-4 font-mono text-right text-stone-700 dark:text-neutral-300">{formatRupee(row.amount)}</td>
                            <td className="px-3 py-4 font-mono text-right font-semibold text-amber-700 dark:text-amber-400">{formatRupee(row.running)}</td>
                            <td className="px-3 py-4 text-stone-300 dark:text-neutral-700">{/* blank — fill by hand */}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="px-4 sm:px-7 py-5 space-y-6">
              {report.months.map((m) => (
                <div key={m.key} className="border border-stone-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <div className="bg-stone-100 dark:bg-neutral-900 px-4 py-2 flex items-center justify-between border-b border-stone-200 dark:border-neutral-800">
                    <span className="font-serif font-semibold text-stone-800 dark:text-stone-200">{MONTHS[m.month]} {m.year}</span>
                    <span className="text-xs font-mono text-stone-600 dark:text-neutral-400">Month total: {formatRupee(m.monthTotal)}</span>
                  </div>
                  {/* Mobile: compact card list */}
                  <div className="sm:hidden divide-y divide-stone-100 dark:divide-neutral-900">
                    {m.rows.map((row, i) => (
                      <div key={i} className={`px-4 py-2.5 ${i % 2 === 1 ? "bg-stone-50 dark:bg-neutral-900/60" : ""}`}>
                        {i === 0 && (
                          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-neutral-400 mb-1">
                            <span className="font-semibold text-stone-700 dark:text-stone-300">{members[activeMember]}</span>
                            <span>Last month: <span className="font-mono">{formatRupee(m.carryIn)}</span></span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm text-stone-900 dark:text-stone-100">{formatDate(row.date)}</span>
                          <span className="font-mono text-sm font-semibold text-amber-700 dark:text-amber-400">{formatRupee(row.running)}</span>
                        </div>
                        <div className="text-xs text-stone-500 dark:text-neutral-400">
                          Weekly: <span className="font-mono text-stone-700 dark:text-neutral-300">{formatRupee(row.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop / tablet: full table */}
                  <table className="w-full text-sm hidden sm:table">
                    <thead>
                      <tr className="text-stone-500 dark:text-neutral-400 text-xs uppercase tracking-wide">
                        <th className="px-3 py-2 text-left font-medium">Date</th>
                        <th className="px-3 py-2 text-left font-medium">Member Name</th>
                        <th className="px-3 py-2 text-left font-medium">Cash Book Pg No.</th>
                        <th className="px-3 py-2 text-right font-medium">Total up to Last Month</th>
                        <th className="px-3 py-2 text-right font-medium">Weekly Savings</th>
                        <th className="px-3 py-2 text-right font-medium">Running Total</th>
                        <th className="px-3 py-2 text-left font-medium">Signature</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-neutral-900">
                      {m.rows.map((row, i) => (
                        <tr key={i} className={i % 2 === 1 ? "bg-stone-50 dark:bg-neutral-900/60" : ""}>
                          <td className="px-3 py-1.5 font-mono text-stone-900 dark:text-stone-100">{formatDate(row.date)}</td>
                          <td className="px-3 py-1.5 text-stone-800 dark:text-stone-200">{i === 0 ? members[activeMember] : ""}</td>
                          <td className="px-3 py-1.5 text-stone-300 dark:text-neutral-700">{/* blank — fill by hand */}</td>
                          <td className="px-3 py-1.5 font-mono text-right text-stone-700 dark:text-neutral-300">{i === 0 ? formatRupee(m.carryIn) : ""}</td>
                          <td className="px-3 py-1.5 font-mono text-right text-stone-700 dark:text-neutral-300">{formatRupee(row.amount)}</td>
                          <td className="px-3 py-1.5 font-mono text-right font-semibold text-amber-700 dark:text-amber-400">{formatRupee(row.running)}</td>
                          <td className="px-3 py-1.5 text-stone-300 dark:text-neutral-700">{/* blank — fill by hand */}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
