export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const YEARS = Array.from({ length: 20 }, (_, i) => 2018 + i);

function pad(n) {
  return String(n).padStart(2, "0");
}

export function formatDate(d) {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatRupee(n) {
  return "₹" + n.toLocaleString("en-IN");
}

// Returns a flat array of Date objects: every occurrence of `weekday`
// (0=Sunday..6=Saturday) from the start of startMonth/startYear through
// the end of endMonth/endYear, inclusive.
export function computeMeetingDates({ startYear, startMonth, endYear, endMonth, weekday }) {
  const start = new Date(startYear, startMonth, 1);
  const end = new Date(endYear, endMonth + 1, 0);
  let d = new Date(start);
  while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);

  const dates = [];
  while (d <= end) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  return dates;
}

// Groups a flat list of meeting dates by year-month and attaches a
// running cumulative total across the whole list.
export function groupWithRunningTotal(dates, weeklyAmount) {
  const months = [];
  let currentKey = null;
  let cumulative = 0;

  dates.forEach((date) => {
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (key !== currentKey) {
      // carryIn = total already saved before this month starts (the ledger's
      // "Total savings up to last month" column, filled once per month block)
      months.push({ key, year: date.getFullYear(), month: date.getMonth(), rows: [], carryIn: cumulative });
      currentKey = key;
    }
    cumulative += weeklyAmount;
    const group = months[months.length - 1];
    group.rows.push({
      date,
      weekNo: group.rows.length + 1,
      amount: weeklyAmount,
      running: cumulative,
    });
  });

  months.forEach((m) => {
    m.monthTotal = m.rows.length * weeklyAmount;
  });

  return { months, totalMeetings: dates.length, totalMonths: months.length, totalPerMember: cumulative };
}
