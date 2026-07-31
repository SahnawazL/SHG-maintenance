import { ArrowLeft, Printer } from "lucide-react";

// A single-page, printable "identity record" for the SHG being set up —
// name, location, member roster, and a signature line, styled to match the
// rest of the app (emerald/stone, serif for the group name). Intended to be
// handed to a bank/scheme officer or kept as a physical group record.
//
// The QR code encodes a short text summary (name, member count, location,
// date) via a public QR-rendering API — NOT member names, and NOT a link to
// any live database, since this app has no backend to verify against yet.
// If a verification endpoint exists later, swap `qrPayload` for a URL to it.
export default function GroupIDCard({ shgName, members, location, onBackHome }) {
  const generatedDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const qrPayload = encodeURIComponent(
    `SHG: ${shgName || "Unnamed SHG"}\nMembers: ${members.length}\nLocation: ${location || "Not specified"}\nGenerated: ${generatedDate}`
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&data=${qrPayload}`;

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-black text-stone-900 dark:text-stone-100 font-sans print:bg-white print:min-h-0">
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          .no-print { display: none !important; }
          .id-card { box-shadow: none !important; border: 1px solid #999 !important; }
        }
      `}</style>

      <div className="max-w-xl mx-auto px-4 py-10 sm:py-14 print:py-0 print:px-0 print:max-w-none">
        <div className="no-print flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 text-sm text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600 dark:focus-visible:ring-emerald-500 rounded-md"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-sm font-medium bg-emerald-700 dark:bg-emerald-600 text-white px-3.5 py-2 rounded-md hover:bg-emerald-800 dark:hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-900 dark:focus-visible:ring-emerald-300"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>

        <div className="id-card bg-white dark:bg-neutral-950 rounded-xl border border-stone-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          {/* Letterhead band */}
          <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 dark:from-emerald-800 dark:to-emerald-950 text-white px-6 py-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-emerald-100/80">
              Self Help Group &middot; Identity Record
            </div>
            <div className="font-serif text-2xl mt-1">{shgName || "Unnamed SHG"}</div>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-stone-400 dark:text-neutral-500">Members</div>
                <div className="font-medium mt-0.5">{members.length}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-stone-400 dark:text-neutral-500">Generated</div>
                <div className="font-medium mt-0.5">{generatedDate}</div>
              </div>
              <div className="col-span-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-stone-400 dark:text-neutral-500">Location</div>
                <div className="font-medium mt-0.5">{location || "Not specified"}</div>
              </div>
            </div>

            <div className="border-t border-dashed border-stone-200 dark:border-neutral-800 pt-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-stone-400 dark:text-neutral-500 mb-2">
                Member List
              </div>
              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm list-decimal list-inside marker:text-stone-400 dark:marker:text-neutral-600">
                {members.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ol>
            </div>

            <div className="flex items-end justify-between border-t border-stone-100 dark:border-neutral-900 pt-4 gap-4">
              <div className="text-[11px] text-stone-500 dark:text-neutral-500">
                <div className="border-b border-stone-300 dark:border-neutral-700 w-40 h-8" />
                <div className="mt-1.5">Signature of Group Leader / Authorized Officer</div>
              </div>
              <img
                src={qrUrl}
                alt="QR code encoding this group's name, member count, location, and generation date"
                width={96}
                height={96}
                className="shrink-0 rounded border border-stone-100 dark:border-neutral-800"
              />
            </div>
          </div>
        </div>

        <p className="no-print text-[11px] text-stone-400 dark:text-neutral-600 mt-4 text-center leading-relaxed">
          The QR code encodes the summary above (SHG name, member count, location, date — no member names) for quick
          reference. It isn't linked to a live database.
        </p>
      </div>
    </div>
  );
}
