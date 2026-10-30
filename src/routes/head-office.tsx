import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { CalendarCheck, Phone, TriangleAlert, Trophy, Filter as FilterIcon, RotateCcw, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { I18nProvider } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { dealerMaster } from "@/lib/dealer-master";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CallingObjectiveGraph } from "@/components/CallingObjectiveGraph";
import { APPOINTMENT_CALL_TARGET, CRITICAL_OF_TARGET, SERVICE_CALL_TARGET, callingObjective, rangeDays, sampleRangeFactor, type DateRange } from "@/lib/head-office-objectives";

export const Route = createFileRoute("/head-office")({
  head: () => ({
    meta: [
      { title: "Head Office — Service Reminder Performance | Telecaller Desk" },
      { name: "description", content: "Head office view of service reminder and appointment confirmation calls across zones, regions and dealers." },
      { property: "og:title", content: "Head Office — Service Reminder Performance" },
      { property: "og:description", content: "Monitor service reminder and appointment confirmation calls by zone, region and dealer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  // Head Office is English only: pin the language for this screen and its chrome.
  component: () => (
    <I18nProvider forcedLang="en">
      <HeadOfficePage />
    </I18nProvider>
  ),
});

const L = {
  title: { en: "Service Reminder Performance", hi: "सर्विस रिमाइंडर प्रदर्शन" },
  sub: { en: "All zones, regions, areas, territories and dealers. Click a row to see the next level.", hi: "सभी ज़ोन, रीजन, एरिया, टेरिटरी और डीलर। अगला स्तर देखने के लिए पंक्ति पर क्लिक करें।" },
  zone: { en: "Zone", hi: "ज़ोन" },
  region: { en: "Region", hi: "रीजन" },
  area: { en: "Area", hi: "एरिया" },
  territory: { en: "Territory", hi: "टेरिटरी" },
  dealer: { en: "Dealer", hi: "डीलर" },
  dealerName: { en: "Dealer Name", hi: "डीलर नाम" },
  all: { en: "All", hi: "सभी" },
  total: { en: "Total", hi: "कुल" },
  sTitle: { en: "Service Reminder Calls", hi: "सर्विस रिमाइंडर कॉल" },
  aTitle: { en: "Appointment Confirmation Calls", hi: "अपॉइंटमेंट कन्फर्मेशन कॉल" },
  due: { en: "Total Calls Due (Pending + Today's)", hi: "कुल ड्यू कॉल (पेंडिंग + आज)" },
  done: { en: "Total Calls Done", hi: "कुल कॉल पूरी" },
  doneP: { en: "Calls Done %", hi: "कॉल पूरी %" },
  conn: { en: "Connected Calls", hi: "बात हुई कॉल" },
  connP: { en: "Connected %", hi: "बात हुई %" },
  created: { en: "Appointment Created", hi: "अपॉइंटमेंट बने" },
  createdP: { en: "Created %", hi: "बने %" },
  appts: { en: "Total Appointment (Today, Pending & Tomorrow)", hi: "कुल अपॉइंटमेंट (आज, पेंडिंग और कल)" },
  aDone: { en: "Calls Done", hi: "कॉल पूरी" },
  conf: { en: "Confirmation Done", hi: "कन्फर्म हुए" },
  confP: { en: "Confirmation %", hi: "कन्फर्म %" },
  canc: { en: "Cancelled", hi: "रद्द" },
  cancP: { en: "Cancelled %", hi: "रद्द %" },
  reported: { en: "Reported", hi: "रिपोर्टेड" },
  repWith: { en: "With CCE Call", hi: "CCE कॉल से" },
  repWithout: { en: "Without CCE Call", hi: "बिना CCE कॉल" },
  repP: { en: "Reported %", hi: "रिपोर्टेड %" },
  dueT: { en: "Total Calls Due", hi: "कुल ड्यू कॉल" },
  apptsT: { en: "Total Appointment", hi: "कुल अपॉइंटमेंट" },
  table: { en: "Table View", hi: "टेबल व्यू" },
  funnel: { en: "Funnel View", hi: "फ़नल व्यू" },
  scrollHint: { en: "Scroll sideways to see all columns.", hi: "सभी कॉलम देखने के लिए साइड में स्क्रॉल करें।" },
  date: { en: "Date", hi: "तारीख" },
  today: { en: "Today", hi: "आज" },
  yesterday: { en: "Yesterday", hi: "कल" },
  thisWeek: { en: "This Week", hi: "यह सप्ताह" },
  thisMonth: { en: "This Month", hi: "यह महीना" },
  topTitle: { en: "Top & Bottom Dealers (Calls Done %)", hi: "टॉप और बॉटम डीलर (कॉल पूरी %)" },
  top5: { en: "Top 5", hi: "टॉप 5" },
  bottom5: { en: "Bottom 5", hi: "बॉटम 5" },
  alertTitle: { en: "Needs Attention", hi: "ध्यान देने की ज़रूरत" },
  alertCalls: { en: "dealers below 80% calls done target", hi: "डीलर 80% कॉल पूरी टारगेट से नीचे" },
  alertConf: { en: "dealers below 100% appointment calling target", hi: "डीलर 60% कन्फर्मेशन टारगेट से नीचे" },
  allGood: { en: "All dealers are on calling target.", hi: "सभी डीलर टारगेट पर हैं। बहुत बढ़िया!" },
  showingBelow: { en: "Showing only dealers below target", hi: "सिर्फ टारगेट से नीचे वाले डीलर दिख रहे हैं" },
  showAll: { en: "Show all", hi: "सभी दिखाएं" },
  apply: { en: "Apply Filters", hi: "फिल्टर लगू करें" },
  clear: { en: "Clear Filters", hi: "फिल्टर हटाएँ" },
  pendingChange: { en: "Filters changed — press Apply to update the numbers.", hi: "फिल्टर बदले हैं — नंबर अपडेट करने के लिए Apply दबाएँ।" },
} as const;
type K = keyof typeof L;

type Row = { zone: string; region: string; area: string; territory: string; dealer: string; dealerName: string; due: number; done: number; conn: number; created: number; appts: number; aDone: number; conf: number; canc: number; resched: number; repWith: number; repWithout: number };
const defaultRange = (): DateRange => { const today = new Date().toISOString().slice(0, 10); return { from: today, to: today }; };

// Real dealer hierarchy; calling figures are sample numbers until reporting is connected.
const makeRows = (f: number): Row[] => dealerMaster.map((d, i) => {
  const s = i + 1;
  // Every sixth sample dealer has barely started calling, so the alerts have something to catch.
  const slow = s % 6 === 0;
  const due = Math.round((300 + ((s * 137) % 400)) * f);
  const done = Math.round(due * (slow ? 0.2 + ((s * 7) % 20) / 100 : 0.55 + ((s * 7) % 40) / 100));
  const conn = Math.round(done * (0.5 + ((s * 11) % 30) / 100));
  const created = Math.round(conn * (0.25 + ((s * 5) % 25) / 100));
  const appts = Math.round((80 + ((s * 53) % 120)) * f);
  const aDone = Math.round(appts * (slow ? 0.3 + ((s * 3) % 25) / 100 : 0.6 + ((s * 3) % 35) / 100));
  const conf = Math.round(aDone * (0.5 + ((s * 13) % 30) / 100));
  const canc = Math.round(aDone * (0.05 + ((s * 7) % 12) / 100));
  const resched = Math.round(aDone * (0.06 + ((s * 5) % 10) / 100));
  const rep = Math.round(appts * (0.25 + ((s * 9) % 30) / 100));
  const repWith = Math.round(rep * 0.7);
  return { zone: d.zone, region: d.region, area: d.area, territory: d.territory, dealer: d.id, dealerName: d.name, due, done, conn, created, appts, aDone, conf, canc, resched, repWith, repWithout: rep - repWith };
});
const levels = ["zone", "region", "area", "territory", "dealer"] as const;
type Level = (typeof levels)[number];
const uniq = (l: string[]) => [...new Set(l)].sort();

const nums = ["due", "done", "conn", "created", "appts", "aDone", "conf", "canc", "resched", "repWith", "repWithout"] as const;
const sum = (list: Row[]) => Object.fromEntries(nums.map((k) => [k, list.reduce((a, r) => a + r[k], 0)])) as Record<(typeof nums)[number], number>;
const p = (a: number, b: number) => `${b ? Math.round((a / b) * 100) : 0}%`;
const n = (x: number) => x.toLocaleString("en-IN");
type S = ReturnType<typeof sum>;

type StatColor = "blue" | "teal" | "green" | "amber" | "orange" | "rose" | "violet" | "cyan";
const pastel: Record<StatColor, string> = {
  blue: "border-stat-blue/20 bg-stat-blue/10",
  teal: "border-stat-teal/20 bg-stat-teal/10",
  green: "border-stat-green/20 bg-stat-green/10",
  amber: "border-stat-amber/25 bg-stat-amber/15",
  orange: "border-stat-orange/20 bg-stat-orange/10",
  rose: "border-stat-rose/20 bg-stat-rose/10",
  violet: "border-stat-violet/20 bg-stat-violet/10",
  cyan: "border-stat-cyan/20 bg-stat-cyan/10",
};
const grad: Record<StatColor, string> = {
  blue: "from-stat-blue to-stat-cyan",
  teal: "from-stat-teal to-stat-green",
  green: "from-stat-green to-stat-teal",
  amber: "from-stat-amber to-stat-orange",
  orange: "from-stat-orange to-stat-rose",
  rose: "from-stat-rose to-stat-violet",
  violet: "from-stat-violet to-stat-blue",
  cyan: "from-stat-cyan to-stat-blue",
};
const dot: Record<StatColor, string> = {
  blue: "bg-stat-blue",
  teal: "bg-stat-teal",
  green: "bg-stat-green",
  amber: "bg-stat-amber",
  orange: "bg-stat-orange",
  rose: "bg-stat-rose",
  violet: "bg-stat-violet",
  cyan: "bg-stat-cyan",
};

type Col = { k: K; v: (r: S) => string; pc?: boolean; th?: K; color: StatColor; target?: number; raw?: (r: S) => number; sub?: (r: S) => [number, number] };

const sCols: Col[] = [
  { k: "due", th: "dueT", v: (r) => n(r.due), color: "blue" },
  { k: "done", v: (r) => n(r.done), color: "teal" },
  { k: "doneP", v: (r) => p(r.done, r.due), pc: true, color: "blue", target: SERVICE_CALL_TARGET, raw: (r) => Math.round((r.done / (r.due || 1)) * 100) },
  { k: "conn", v: (r) => n(r.conn), color: "cyan" },
  { k: "connP", v: (r) => p(r.conn, r.done), pc: true, color: "cyan" },
  { k: "created", v: (r) => n(r.created), color: "green" },
  { k: "createdP", v: (r) => p(r.created, r.conn), pc: true, color: "green" },
];
const aCols: Col[] = [
  { k: "appts", th: "apptsT", v: (r) => n(r.appts), color: "blue" },
  { k: "aDone", v: (r) => n(r.aDone), color: "teal" },
  { k: "doneP", v: (r) => p(r.aDone, r.appts), pc: true, color: "teal", target: APPOINTMENT_CALL_TARGET, raw: (r) => r.appts ? r.aDone / r.appts * 100 : 100 },
  { k: "conf", v: (r) => n(r.conf), color: "green" },
  { k: "confP", v: (r) => p(r.conf, r.aDone), pc: true, color: "green" },
  { k: "canc", v: (r) => n(r.canc), color: "rose" },
  { k: "cancP", v: (r) => p(r.canc, r.aDone), pc: true, color: "rose" },
  { k: "reported", v: (r) => n(r.repWith + r.repWithout), color: "amber", sub: (r) => [r.repWith, r.repWithout] },
  { k: "repP", v: (r) => p(r.repWith + r.repWithout, r.appts), pc: true, color: "amber" },
];

// Components live at module level so React patches the existing table instead of
// rebuilding it, which is what used to yank the page scroll around.
// Head Office dashboard is English only.
const t = (k: K) => L[k].en;

function Filter({ label, value, onChange, opts }: { label: string; value: string; onChange: (v: string) => void; opts: string[] }) {
  return (
    <label className="flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card">
      <span className="px-3 pt-2 text-xs font-bold text-primary">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="m-2 rounded-md border bg-background px-2 py-1.5 text-sm">
        <option value="">{t("all")}</option>
        {opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Cell({ r, c }: { r: S; c: Col }) {
  return (
    <>
      {c.v(r)}
      {c.sub && (
        <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground">
          {t("repWith")} {c.sub(r)[0]} · {t("repWithout")} {c.sub(r)[1]}
        </span>
      )}
    </>
  );
}

function FunnelSteps({ steps, colors }: { steps: [string, number][]; colors: StatColor[] }) {
  const base = steps[0]?.[1] || 1;
  return (
    <div className="space-y-3">
      {steps.map(([label, val], i) => {
        const share = Math.round((val / base) * 100);
        const w = Math.max(30, share);
        const prev = i > 0 ? steps[i - 1]?.[1] ?? 0 : 0;
        const step = i > 0 && prev ? Math.round((val / prev) * 100) : null;
        const c = colors[i] ?? "blue";
        return (
          <div key={label}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <span className={cn("h-2 w-2 rounded-full", dot[c])} />
                {i + 1}. {label}
              </span>
              {step !== null && <span className={cn("whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold", pastel[c])}>{step}% ← {i}</span>}
            </div>
            <div className="flex justify-center">
              <div className={cn("flex h-10 items-center justify-center rounded-lg bg-gradient-to-r text-primary-foreground shadow-md", grad[c])} style={{ width: `${w}%` }}>
                <span className="whitespace-nowrap text-sm font-extrabold">{val.toLocaleString("en-IN")} · {share}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Section({
  title, cols, icon: Icon, tint, level, view, below, setLevel, setView, setBelow, groups, tot, tableTot, onDrill, steps, stepColors, topRef, barRef, stay,
}: {
  title: K; cols: Col[]; icon: typeof Phone; tint: string;
  level: Level; view: "table" | "funnel"; below: boolean;
  setLevel: (l: Level) => void; setView: (v: "table" | "funnel") => void; setBelow: (b: boolean) => void;
  groups: { k: string; name: string; s: S }[]; tot: S; tableTot: S; onDrill: (k: string) => void;
  steps: [string, number][]; stepColors: StatColor[];
  topRef: { current: HTMLDivElement | null }; barRef: { current: HTMLDivElement | null }; stay: (run: () => void) => void;
}) {
  return (
    <section ref={topRef} className={cn("mb-6 scroll-mt-24 rounded-2xl border p-4 shadow-card md:p-5", tint)}>
      <h2 className="mb-3 flex items-center gap-2.5 text-lg font-extrabold">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Icon className="h-4.5 w-4.5" />
        </span>
        {t(title)}
      </h2>
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-5">
        {cols.map((c) => (
          <div key={c.k} className={cn("rounded-xl border p-3", pastel[c.color])}>
            <p className="text-[11px] font-bold leading-tight text-muted-foreground">{t(c.k)}</p>
            <p className={cn("mt-1 text-xl font-extrabold", c.pc && "text-primary")}>{c.v(tot)}</p>
            {c.sub && (
              <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                {t("repWith")} {n(tot.repWith)} · {t("repWithout")} {n(tot.repWithout)}
              </p>
            )}
          </div>
        ))}
      </div>

      <div ref={barRef} className="mb-3 space-y-2">
        <div className="inline-flex rounded-lg border bg-card p-1 shadow-card">
          {(["table", "funnel"] as const).map((v) => (
            <button key={v} onClick={() => stay(() => setView(v))} className={cn("rounded-md px-4 py-1.5 text-sm font-bold", view === v ? "bg-primary text-primary-foreground" : "text-primary hover:bg-secondary")}>{t(v)}</button>
          ))}
        </div>
        {view === "table" && (
          <div className="inline-flex flex-wrap rounded-lg border bg-card p-1 shadow-card">
            {levels.map((l) => (
              <button key={l} onClick={() => stay(() => { setLevel(l); setBelow(false); })} className={cn("rounded-md px-4 py-1.5 text-sm font-bold", level === l ? "bg-primary text-primary-foreground" : "text-primary hover:bg-secondary")}>{t(l)}</button>
            ))}
          </div>
        )}
      </div>

      {below && view === "table" && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
          <span>{t("showingBelow")}</span>
          <button onClick={() => stay(() => setBelow(false))} className="ml-auto rounded-md bg-card px-2.5 py-1 text-xs font-bold text-destructive shadow-sm hover:bg-secondary">{t("showAll")}</button>
        </div>
      )}

      {view === "funnel" ? (
        <div className="rounded-xl border bg-card p-4">
          <FunnelSteps steps={steps} colors={stepColors} />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className={cn("w-full text-sm", cols.length > 8 ? "min-w-[940px]" : "min-w-[820px]")}>
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">{t(level)}</th>
                {level === "dealer" && <th className="px-3 py-2 text-left font-semibold">{t("dealerName")}</th>}
                {cols.map((c) => <th key={c.k} className="px-2 py-2 text-center text-xs font-semibold">{t(c.th ?? c.k)}</th>)}
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.k} onClick={() => onDrill(g.k)} className={cn("border-b text-center odd:bg-muted/40", level !== "dealer" && "cursor-pointer hover:bg-secondary")}>
                  <td className="px-3 py-2 text-left font-semibold">{g.k}</td>
                  {level === "dealer" && <td className="px-3 py-2 text-left">{g.name}</td>}
                  {cols.map((c) => {
                    const bad = c.target != null && c.raw ? c.raw(g.s) < c.target : false;
                    return <td key={c.k} className={cn("px-2 py-2", c.pc && "font-bold", c.pc && (bad ? "text-stat-rose" : "text-primary"))}><Cell r={g.s} c={c} /></td>;
                  })}
                </tr>
              ))}
              <tr className="bg-secondary text-center font-extrabold">
                <td className="px-3 py-2 text-left" colSpan={level === "dealer" ? 2 : 1}>{t("total")}</td>
                {cols.map((c) => <td key={c.k}><Cell r={tableTot} c={c} /></td>)}
              </tr>
            </tbody>
          </table>
          <p className="mt-2 px-3 text-[11px] font-semibold text-muted-foreground lg:hidden">{t("scrollHint")}</p>
        </div>
      )}
    </section>
  );
}

function HeadOfficePage() {
  const [f, setF] = useState<Record<Exclude<Level, "dealer">, string>>({ zone: "", region: "", area: "", territory: "" });
  const [draft, setDraft] = useState(f);
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [draftRange, setDraftRange] = useState<DateRange>(range);
  const [popup, setPopup] = useState<"attention" | "ranking" | null>(null);
  const validRange = rangeDays(draftRange) > 0;

  // Each report section keeps its own view and drill level.
  const [sLv, setSLv] = useState<Level>("zone");
  const [sView, setSView] = useState<"table" | "funnel">("table");
  const [sBelow, setSBelow] = useState(false);
  const [aLv, setALv] = useState<Level>("zone");
  const [aView, setAView] = useState<"table" | "funnel">("table");
  const [aBelow, setABelow] = useState(false);

  const sTop = useRef<HTMLDivElement>(null);
  const aTop = useRef<HTMLDivElement>(null);
  const sBar = useRef<HTMLDivElement>(null);
  const aBar = useRef<HTMLDivElement>(null);
  const spacer = useRef<HTMLDivElement>(null);

  // Holds the clicked tab bar exactly where it is while the table re-sorts. If the
  // table got shorter and the page ran out of room below, make room and try again.
  const makeStay = (bar: { current: HTMLElement | null }) => (run: () => void) => {
    const before = bar.current?.getBoundingClientRect().top ?? 0;
    run();
    requestAnimationFrame(() => {
      const el = bar.current;
      if (!el) return;
      const scrollBy = (d: number) => window.scrollBy({ top: d, behavior: "instant" as ScrollBehavior });
      const first = el.getBoundingClientRect().top - before;
      if (Math.abs(first) <= 1) return;
      scrollBy(first);
      const left = el.getBoundingClientRect().top - before;
      if (left > 1 && spacer.current) {
        spacer.current.style.height = `${Math.round(spacer.current.offsetHeight + left)}px`;
        scrollBy(left);
      }
    });
  };

  const rows = useMemo(() => makeRows(sampleRangeFactor(range)), [range]);

  const withFilter = (src: typeof f, k: keyof typeof f, v: string): typeof f => {
    const idx = levels.indexOf(k);
    return Object.fromEntries(Object.entries(src).map(([key, val]) => [key, key === k ? v : levels.indexOf(key as Level) > idx ? "" : val])) as typeof f;
  };
  const setFilter = (k: keyof typeof f, v: string) => setDraft((cur) => withFilter(cur, k, v));
  const matchUpTo = (r: Row, upto: number, src: typeof f) => (Object.keys(src) as (keyof typeof f)[]).every((k) => levels.indexOf(k) >= upto || !src[k] || r[k] === src[k]);

  const filtered = rows.filter((r) => matchUpTo(r, 99, f));
  const tot = sum(filtered);
  const optsFor = (k: keyof typeof f) => uniq(rows.filter((r) => matchUpTo(r, levels.indexOf(k), draft)).map((r) => r[k]));

  const dirty = draftRange.from !== range.from || draftRange.to !== range.to || (Object.keys(f) as (keyof typeof f)[]).some((k) => draft[k] !== f[k]);
  const applyFilters = () => { setF(draft); setRange(draftRange); setSBelow(false); setABelow(false); };
  const clearFilters = () => {
    const blank = { zone: "", region: "", area: "", territory: "" };
    setDraft(blank); setF(blank); setDraftRange(defaultRange()); setRange(defaultRange());
    setSLv("zone"); setSView("table"); setSBelow(false);
    setALv("zone"); setAView("table"); setABelow(false);
  };

  const belowIds = (kind: "calls" | "conf") => {
    const m = new Map<string, Row[]>();
    filtered.forEach((r) => m.set(r.dealer, [...(m.get(r.dealer) ?? []), r]));
    return new Set([...m.entries()].filter(([, list]) => {
      const s = sum(list);
      return kind === "calls" ? callingObjective(s.due, s.done, SERVICE_CALL_TARGET).below : callingObjective(s.appts, s.aDone, APPOINTMENT_CALL_TARGET).below;
    }).map(([k]) => k));
  };

  const groupFor = (level: Level, below: boolean, kind: "calls" | "conf") => {
    const list = below ? filtered.filter((r) => belowIds(kind).has(r.dealer)) : filtered;
    const m = new Map<string, Row[]>();
    list.forEach((r) => m.set(r[level], [...(m.get(r[level]) ?? []), r]));
    const groups = [...m.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, rows2]) => ({ k, name: level === "dealer" ? (rows2[0]?.dealerName ?? "") : "", s: sum(rows2) }));
    return { groups, tableTot: sum(list) };
  };

  const sData = groupFor(sLv, sBelow, "calls");
  const aData = groupFor(aLv, aBelow, "conf");

  const drill = (level: Level, k: string, setLv: (l: Level) => void, setBelow: (b: boolean) => void) => {
    if (level === "dealer") return;
    const next = withFilter(draft, level as keyof typeof f, k);
    setDraft(next);
    setF(next);
    const nextLevel = levels[levels.indexOf(level) + 1];
    if (nextLevel) setLv(nextLevel);
    setBelow(false);
  };

  const showBelow = (kind: "calls" | "conf") => {
    setPopup(null);
    if (kind === "calls") {
      setSView("table"); setSLv("dealer"); setSBelow(true);
      requestAnimationFrame(() => sTop.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } else {
      setAView("table"); setALv("dealer"); setABelow(true);
      requestAnimationFrame(() => aTop.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };

  const dealerStats = useMemo(() => {
    const m = new Map<string, Row[]>();
    filtered.forEach((r) => m.set(r.dealer, [...(m.get(r.dealer) ?? []), r]));
    return [...m.entries()].map(([k, list]) => ({ id: k, name: (list[0]?.dealerName ?? ""), s: sum(list) }));
  }, [filtered]);
  const byDone = [...dealerStats].sort((a, b) => b.s.done / (b.s.due || 1) - a.s.done / (a.s.due || 1));
  const top5 = byDone.slice(0, 5);
  const bottom5 = byDone.slice(-5).reverse();
  const lowCalls = dealerStats.filter((d) => callingObjective(d.s.due, d.s.done, SERVICE_CALL_TARGET).below).length;
  const lowConf = dealerStats.filter((d) => callingObjective(d.s.appts, d.s.aDone, APPOINTMENT_CALL_TARGET).below).length;
  const attentionCount = new Set([...belowIds("calls"), ...belowIds("conf")]).size;
  const isCritical = (d: { s: S }, kind: "calls" | "conf") => kind === "calls"
    ? callingObjective(d.s.due, d.s.done, SERVICE_CALL_TARGET).critical
    : callingObjective(d.s.appts, d.s.aDone, APPOINTMENT_CALL_TARGET).critical;
  const criticalCalls = dealerStats.filter((d) => isCritical(d, "calls")).length;
  const criticalConf = dealerStats.filter((d) => isCritical(d, "conf")).length;
  const criticalCount = dealerStats.filter((d) => isCritical(d, "calls") || isCritical(d, "conf")).length;

  return (
    <AppShell>
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold">{t("title")}</h1>
        <p className="mt-1 text-xs text-muted-foreground">Sample reporting data · {range.from} to {range.to}</p>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-[minmax(240px,1.8fr)_repeat(4,minmax(0,1fr))]">
        <fieldset className="col-span-2 min-w-0 rounded-lg border bg-card px-3 pb-3 sm:col-span-4 md:col-span-1">
          <legend className="px-1 text-xs font-bold text-primary">Date range</legend>
          <div className="grid grid-cols-2 gap-2">
            <label className="min-w-0 text-[11px] font-medium text-muted-foreground">From<Input aria-label="From date" type="date" value={draftRange.from} onChange={(e) => setDraftRange((r) => ({ ...r, from: e.target.value }))} className="mt-1 min-w-0 px-2" /></label>
            <label className="min-w-0 text-[11px] font-medium text-muted-foreground">To<Input aria-label="To date" type="date" value={draftRange.to} min={draftRange.from} onChange={(e) => setDraftRange((r) => ({ ...r, to: e.target.value }))} className="mt-1 min-w-0 px-2" /></label>
          </div>
        </fieldset>
        {(Object.keys(f) as (keyof typeof f)[]).map((k) => <Filter key={k} label={t(k)} value={draft[k]} onChange={(v) => setFilter(k, v)} opts={optsFor(k)} />)}
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Button onClick={applyFilters} disabled={!dirty || !validRange} size="sm"><FilterIcon />{t("apply")}</Button>
        <Button onClick={clearFilters} variant="outline" size="sm"><RotateCcw />{t("clear")}</Button>
        {!validRange && <span role="alert" className="text-xs text-destructive">Choose an end date on or after the start date.</span>}
      </div>

      <CallingObjectiveGraph key={`${range.from}:${range.to}:${JSON.stringify(f)}`} rows={filtered} />

      <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-3 md:left-20">
        <div className="flex max-w-full items-center gap-2 rounded-lg border bg-card p-2 shadow-card">
          <Button size="sm" onClick={() => setPopup("attention")} className="relative bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 hover:bg-destructive/90"><TriangleAlert />{t("alertTitle")}<span className="rounded-full bg-destructive-foreground/25 px-1.5 tabular-nums">{attentionCount}</span>{attentionCount > 0 && <span aria-hidden className="absolute -right-1.5 -top-1.5 flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" /><span className="relative inline-flex h-3 w-3 rounded-full bg-destructive ring-2 ring-card" /></span>}</Button>
          <Button variant="outline" size="sm" className="border-stat-blue/25 bg-stat-blue/5 text-stat-blue" onClick={() => setPopup("ranking")}><Trophy /><span className="sm:hidden">Dealer Rankings</span><span className="hidden sm:inline">Top & Bottom Dealers</span></Button>
        </div>
      </div>
      <Dialog open={popup !== null} onOpenChange={(open) => { if (!open) setPopup(null); }}>
        <DialogContent className={cn("max-h-[80dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto bg-card", popup && "gap-0 border-t-4 p-0", popup === "ranking" ? "border-t-stat-blue" : "border-t-destructive")} onCloseAutoFocus={(event) => event.preventDefault()}>
          <DialogHeader className={cn("border-b p-5 text-left", popup === "ranking" ? "bg-performance-band" : "bg-destructive/5")}>
            <DialogTitle className="flex items-center gap-3 pr-6"><span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg border", popup === "ranking" ? "border-stat-blue/20 bg-stat-blue/10 text-stat-blue" : "border-destructive/30 bg-destructive/10 text-destructive")}>{popup === "ranking" ? <Trophy className="h-5 w-5" /> : <TriangleAlert className="h-5 w-5" />}</span>{popup === "attention" ? t("alertTitle") : t("topTitle")}</DialogTitle>
            <DialogDescription>{range.from} to {range.to} · {filtered.length} dealers · Sample reporting data</DialogDescription>
          </DialogHeader>
          {popup === "attention" ? <div className="space-y-3 p-5">
            <p className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold", attentionCount ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-stat-green/30 bg-stat-green/5 text-stat-green")}>{attentionCount > 0 && <TriangleAlert className="h-4 w-4 shrink-0" />}{attentionCount} of {dealerStats.length} dealers below calling target{criticalCount > 0 ? ` · ${criticalCount} of them under ${CRITICAL_OF_TARGET}% of it` : ""}</p>
            {([{ kind: "calls", count: lowCalls, critical: criticalCalls, title: "Service Reminder Calls", target: "80% of total calls due" }, { kind: "conf", count: lowConf, critical: criticalConf, title: "Appointment Confirmation Calls", target: "100% of total appointments" }] as const).map((item) => <div key={item.kind} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div><p className="text-sm font-bold">{item.title}</p><p className="mt-1 text-sm"><strong className="text-destructive">{item.count} dealers</strong> below calling target</p><p className="mt-1 text-xs font-bold text-destructive">{item.critical} under {CRITICAL_OF_TARGET}% of the required calls</p><p className="mt-1 text-xs text-muted-foreground">Target: {item.target}</p></div>
              <Button size="sm" disabled={item.count === 0} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => showBelow(item.kind)}>View {item.count} dealers<ArrowRight /></Button>
            </div>)}
            {lowCalls === 0 && lowConf === 0 && <p className="text-sm text-stat-green">{t("allGood")}</p>}
          </div> : <div className="grid md:grid-cols-2">
            {([{ label: "top5", list: top5, tone: "green" }, { label: "bottom5", list: bottom5, tone: "rose" }] as const).map((g) => <div key={g.label} className="min-w-0 px-5 py-4 first:border-b md:first:border-b-0 md:first:border-r">
              <h3 className={cn("mb-1 flex items-center justify-between border-b pb-3 text-sm font-extrabold", g.tone === "green" ? "border-stat-green/20 text-stat-green" : "border-stat-rose/20 text-stat-rose")}><span className="flex items-center gap-2">{g.tone === "green" ? <Trophy className="h-4 w-4" /> : <TriangleAlert className="h-4 w-4" />}{t(g.label)}</span><span className={cn("rounded-sm px-2 py-1 text-[10px] font-semibold", g.tone === "green" ? "bg-stat-green/10" : "bg-stat-rose/10")}>{g.tone === "green" ? "Highest coverage" : "Lowest coverage"}</span></h3>
              <ol className="divide-y">{g.list.map((d, i) => <li key={d.id} className="py-4 text-sm">
                <div className="flex items-start gap-3"><span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-extrabold", g.tone === "green" ? (i === 0 ? "border-stat-amber/30 bg-stat-amber/15 text-stat-amber" : "border-stat-green/20 bg-stat-green/10 text-stat-green") : "border-stat-rose/20 bg-stat-rose/10 text-stat-rose")}>{i + 1}</span><div className="min-w-0 flex-1"><p className="break-words text-xs font-bold leading-relaxed">{d.name}</p><p className="mt-1 text-[10px] text-muted-foreground">{d.id} · {n(d.s.done)} / {n(d.s.due)} calls</p></div><strong className={cn("shrink-0 text-base tabular-nums", g.tone === "green" ? "text-stat-green" : "text-stat-rose")}>{p(d.s.done, d.s.due)}</strong></div>
                <div className="relative ml-10 mt-3 h-1.5 rounded-full bg-muted"><div className={cn("h-full rounded-full", g.tone === "green" ? "bg-stat-green" : "bg-stat-rose")} style={{ width: `${Math.min(100, d.s.done / (d.s.due || 1) * 100)}%` }} /><span className="absolute -bottom-1 -top-1 left-[80%] border-l border-dashed border-foreground/50" title="80% calling target" /></div>
              </li>)}</ol>
            </div>)}
            <p className="col-span-full flex items-center gap-2 border-t bg-muted/40 px-5 py-3 text-[11px] text-muted-foreground"><span className="h-3 border-l border-dashed border-foreground/50" />80% service calling target</p>
          </div>}
        </DialogContent>
      </Dialog>

      <Section
        title="sTitle" cols={sCols} icon={Phone} tint="bg-stat-blue/5"
        level={sLv} view={sView} below={sBelow}
        setLevel={setSLv} setView={setSView} setBelow={setSBelow}
        groups={sData.groups} tot={tot} tableTot={sData.tableTot}
        onDrill={(k) => drill(sLv, k, setSLv, setSBelow)}
        topRef={sTop} barRef={sBar} stay={makeStay(sBar)}
        steps={[[t("dueT"), tot.due], [t("done"), tot.done], [t("conn"), tot.conn], [t("created"), tot.created]]}
        stepColors={["blue", "teal", "cyan", "green"]}
      />
      <Section
        title="aTitle" cols={aCols} icon={CalendarCheck} tint="bg-stat-violet/5"
        level={aLv} view={aView} below={aBelow}
        setLevel={setALv} setView={setAView} setBelow={setABelow}
        groups={aData.groups} tot={tot} tableTot={aData.tableTot}
        onDrill={(k) => drill(aLv, k, setALv, setABelow)}
        topRef={aTop} barRef={aBar} stay={makeStay(aBar)}
        steps={[[t("apptsT"), tot.appts], [t("aDone"), tot.aDone], [t("conf"), tot.conf], [t("reported"), tot.repWith + tot.repWithout], [t("repWith"), tot.repWith]]}
        stepColors={["blue", "teal", "green", "amber", "orange"]}
      />
      <div className="h-20" aria-hidden />
      <div ref={spacer} aria-hidden className="h-0" />
    </AppShell>
  );
}
