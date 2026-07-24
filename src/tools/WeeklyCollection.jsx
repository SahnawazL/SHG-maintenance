import { useState } from "react";
import { ChevronLeft, ChevronRight, Users, Calendar, Wallet, ArrowLeft } from "lucide-react";
import { WEEKDAYS, MONTHS, YEARS, formatDate, formatRupee, computeMeetingDates, groupWithRunningTotal } from "../lib/dates.js";

const inputClass =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">{label}</span>
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

  const startAfterEnd = startYear > endYear || (startYear === endYear && startMonth > endMonth);
  const canGenerate = weeklyAmount > 0 && !startAfterEnd;

  function handleGenerate() {
    if (!canGenerate) return;
    const dates = computeMeetingDates({ startYear, startMonth, endYear, endMonth, weekday });
    const grouped = groupWithRunningTotal(dates, Number(weeklyAmount));
    setReport({ ...grouped, totalGroup: grouped.totalPerMember * members.length });
    setActiveMember(0);
    setStage("report");
  }

  if (stage === "setup") {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 sm:py-10">
        <button type="button" onClick={onBackHome} className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 mb-5">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </button>

        <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase mb-2">{shgName}</p>
        <h1 className="text-2xl font-serif font-semibold text-stone-900 leading-tight mb-1">Weekly Collection Report</h1>
        <p className="text-stone-600 text-sm mb-6">Every meeting date, weekday and running total, calculated automatically.</p>

        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 sm:p-6 space-y-5">
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
            <span className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">Start Month</span>
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
            <span className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">End Month</span>
            <div className="grid grid-cols-2 gap-3">
              <select className={inputClass} value={endMonth} onChange={(e) => setEndMonth(Number(e.target.value))}>
                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
              <select className={inputClass} value={endYear} onChange={(e) => setEndYear(Number(e.target.value))}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {startAfterEnd && <p className="text-xs text-red-600 mt-1.5">End month must be after start month.</p>}
          </div>

          <button
            type="button"
            disabled={!canGenerate}
            onClick={handleGenerate}
            className="w-full rounded-md bg-emerald-700 text-white font-semibold py-2.5 text-sm hover:bg-emerald-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
          >
            Generate Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
      <button type="button" onClick={() => setStage("setup")} className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to setup
      </button>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="bg-emerald-700 text-white px-5 py-5 sm:px-7 sm:py-6">
          <p className="text-xs uppercase tracking-widest text-emerald-100 mb-1">Weekly Collection Register</p>
          <h1 className="text-2xl font-serif font-semibold">{shgName}</h1>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-sm text-emerald-50">
            <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Every {WEEKDAYS[weekday]}</span>
            <span className="inline-flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> {formatRupee(weeklyAmount)} / member / week</span>
            <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {members.length} members</span>
          </div>
          <p className="text-xs text-emerald-100 mt-2">{MONTHS[startMonth]} {startYear} → {MONTHS[endMonth]} {endYear}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-stone-200 border-b border-stone-200">
          {[
            ["Total Meetings", report.totalMeetings],
            ["Months Covered", report.totalMonths],
            ["Per-Member Total", formatRupee(report.totalPerMember)],
            ["Group Total", formatRupee(report.totalGroup)],
          ].map(([label, val]) => (
            <div key={label} className="px-4 py-3 text-center">
              <div className="text-lg font-mono font-semibold text-stone-900">{val}</div>
              <div className="text-[11px] text-stone-500 uppercase tracking-wide mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 px-5 sm:px-7 py-3 bg-stone-50 border-b border-stone-200">
          <button type="button" onClick={() => setActiveMember((i) => Math.max(0, i - 1))} disabled={activeMember === 0} className="p-1.5 rounded-md border border-stone-300 disabled:opacity-30 hover:bg-white">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 text-center">
            <span className="text-xs text-stone-500">Copy page for</span>
            <div className="font-semibold text-stone-900 text-sm">
              {members[activeMember]} <span className="text-stone-400 font-normal">({activeMember + 1} of {members.length})</span>
            </div>
          </div>
          <button type="button" onClick={() => setActiveMember((i) => Math.min(members.length - 1, i + 1))} disabled={activeMember === members.length - 1} className="p-1.5 rounded-md border border-stone-300 disabled:opacity-30 hover:bg-white">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-xs text-stone-500 px-5 pt-3">
          Dates, weekday and running totals below are identical for every member — only the name changes. Write this same table into each member's page.
        </p>

        <div className="px-4 sm:px-7 py-5 space-y-6">
          {report.months.map((m) => (
            <div key={m.key} className="border border-stone-200 rounded-lg overflow-hidden">
              <div className="bg-stone-100 px-4 py-2 flex items-center justify-between border-b border-stone-200">
                <span className="font-serif font-semibold text-stone-800">{MONTHS[m.month]} {m.year}</span>
                <span className="text-xs font-mono text-stone-600">Month total: {formatRupee(m.monthTotal)}</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-stone-500 text-xs uppercase tracking-wide">
                    <th className="px-3 py-2 text-left font-medium">Date</th>
                    <th className="px-3 py-2 text-left font-medium">Member Name</th>
                    <th className="px-3 py-2 text-left font-medium">Cash Book Pg No.</th>
                    <th className="px-3 py-2 text-right font-medium">Total up to Last Month</th>
                    <th className="px-3 py-2 text-right font-medium">Weekly Savings</th>
                    <th className="px-3 py-2 text-right font-medium">Running Total</th>
                    <th className="px-3 py-2 text-left font-medium">Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {m.rows.map((row, i) => (
                    <tr key={i} className={i % 2 === 1 ? "bg-stone-50" : ""}>
                      <td className="px-3 py-1.5 font-mono text-stone-900">{formatDate(row.date)}</td>
                      <td className="px-3 py-1.5 text-stone-800">{i === 0 ? members[activeMember] : ""}</td>
                      <td className="px-3 py-1.5 text-stone-300">{/* blank — fill by hand */}</td>
                      <td className="px-3 py-1.5 font-mono text-right text-stone-700">{i === 0 ? formatRupee(m.carryIn) : ""}</td>
                      <td className="px-3 py-1.5 font-mono text-right text-stone-700">{formatRupee(row.amount)}</td>
                      <td className="px-3 py-1.5 font-mono text-right font-semibold text-amber-700">{formatRupee(row.running)}</td>
                      <td className="px-3 py-1.5 text-stone-300">{/* blank — fill by hand */}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
