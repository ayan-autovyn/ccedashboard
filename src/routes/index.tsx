import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, ListOrdered, PhoneCall } from "lucide-react";
import { ActivityStrip, AppShell } from "@/components/AppShell";
import { useI18n, type Key } from "@/lib/i18n";
import { agent, appts, leads } from "@/lib/data";
import { pct, useReport, useStore } from "@/lib/store";
import { callingProgress } from "@/lib/calling-progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Telecaller Dashboard — Daily Calls & Appointments" },
      { name: "description", content: "Daily work dashboard for CCE telecallers: service reminder calls and appointment confirmations in English and Hindi." },
      { property: "og:title", content: "Telecaller Dashboard — Daily Calls & Appointments" },
      { property: "og:description", content: "See today's calling targets and jump straight to your calling lists." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Tile = { label: Key; hint?: Key; value: number; total?: number; tone: string; to: "/smr-followup" | "/smr-appointments"; tab: string; link?: boolean };

function StatTile({ tile }: { tile: Tile }) {
  const { t } = useI18n();
  const p = tile.total !== undefined ? pct(tile.value, tile.total) : undefined;
  const body = <>
    <span className="desk-metric-label min-w-0 text-xs font-medium leading-snug text-foreground">{t(tile.label)}</span>
    <span className="flex shrink-0 items-center justify-end gap-3">{tile.link && <ArrowRight className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}<span className={cn("text-xl font-bold leading-6 tabular-nums", tile.tone)}>{tile.value}</span><span className="w-8 text-right text-xs tabular-nums text-muted-foreground">{p !== undefined ? `${p}%` : "—"}</span></span>
  </>;
  const classes = "desk-stat grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/50 py-1 last:border-0";
  if (!tile.link) return <div className={classes}>{body}</div>;
  return <Link to={tile.to} search={{ tab: tile.tab }} aria-label={`${t(tile.label)} — ${t("open")}`} className={cn(classes, "text-primary hover:bg-secondary focus-visible:outline focus-visible:outline-ring")}>{body}</Link>;
}

function Section({ icon: Icon, title, tiles }: { icon: typeof PhoneCall; title: Key; tiles: Tile[] }) {
  const { t } = useI18n();
  return <section className={cn("desk-report min-w-0", title === "serviceCallsTitle" ? "desk-report-service" : "desk-report-appointments")}>
    <h2 className="mb-1 flex items-center gap-2 text-sm font-bold leading-snug"><Icon className="h-4 w-4 shrink-0 text-primary" />{t(title)}</h2>
    <div className="desk-metrics">{tiles.map((tile) => <StatTile key={tile.label} tile={tile} />)}</div>
  </section>;
}

type FlowStep = { n: number; label: Key; to: Tile["to"]; tab: string; count: number; active: boolean };

function FlowGuide({ steps }: { steps: FlowStep[] }) {
  const { t } = useI18n();
  return <section className="desk-flow min-w-0">
    <h2 className="mb-2 flex items-center gap-2 border-b pb-2 text-sm font-bold leading-snug text-primary"><ListOrdered className="h-4 w-4 shrink-0 text-primary" />{t("flowTitle")}</h2>
    <ol className="space-y-1">
      {steps.map((s) => <li key={s.n}><Link to={s.to} search={{ tab: s.tab }} className={cn("desk-flow-row flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-secondary focus-visible:outline focus-visible:outline-ring", s.active ? "bg-secondary text-primary" : "text-foreground")}>
        <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold", s.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{s.n}</span>
        <span className="min-w-0 flex-1 text-[13px] font-medium leading-snug">{t(s.label)}</span>
        <span className="text-xs font-bold tabular-nums">{s.count}</span>
        <ArrowRight className="h-3 w-3 shrink-0 text-primary" />
      </Link></li>)}
    </ol>
  </section>;
}

function Dashboard() {
  const { t } = useI18n();
  const r = useReport();
  const store = useStore();
  const progress = callingProgress(leads, store.appts, store.leadOutcome, store.apptCalled);
  const s = r.service, a = r.appt;
  const reported = a.reportedWith + a.reportedWithout;

  const serviceTiles: Tile[] = [
    { label: "callsDue", hint: "callsDueHint", value: s.due, tone: "text-primary", to: "/smr-followup", tab: "total", link: true },
    { label: "callsDone", value: s.callsDone, total: s.due, tone: "text-info", to: "/smr-followup", tab: "total" },
    { label: "connected", value: s.connected, total: s.callsDone, tone: "text-success", to: "/smr-followup", tab: "followup" },
    { label: "apptCreated", value: s.apptCreated, total: s.connected, tone: "text-warning", to: "/smr-appointments", tab: "total" },
  ];
  const apptTiles: Tile[] = [
    { label: "totalAppt", hint: "totalApptHint", value: a.total, tone: "text-primary", to: "/smr-appointments", tab: "total", link: true },
    { label: "callsDone", value: a.callsDone, total: a.total, tone: "text-info", to: "/smr-appointments", tab: "total" },
    { label: "confirmed", value: a.confirmed, total: a.total, tone: "text-success", to: "/smr-appointments", tab: "today" },
    { label: "cancelled", value: a.cancelled, total: a.total, tone: "text-destructive", to: "/smr-appointments", tab: "lost" },
    { label: "reported", value: reported, total: appts.length, tone: "text-warning", to: "/smr-appointments", tab: "reported" },
  ];


  const flowSteps: FlowStep[] = progress.groups.map((group, i) => ({
    n: i + 1, label: group.label, to: group.to, tab: group.bucket,
    count: group.total, active: group === progress.next,
  }));

  return (
    <AppShell compact>
      <div className="desk-dashboard">
        <div className="desk-greeting grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h1 className="min-w-0 text-lg font-extrabold">{t("greeting")}, {agent.split(" ")[0]}</h1>
        </div>
        <ActivityStrip compact />
        <div className="desk-columns">
          <FlowGuide steps={flowSteps} />
          <Section icon={PhoneCall} title="serviceCallsTitle" tiles={serviceTiles} />
            <div className="desk-appointment-column min-w-0">
            <Section icon={CalendarCheck} title="apptTitle" tiles={apptTiles} />
            <p className="mt-1 text-right text-xs leading-snug text-muted-foreground">{t("withCce")}: <strong>{a.reportedWith}</strong> · {t("withoutCce")}: <strong>{a.reportedWithout}</strong></p>
            </div>
        </div>
      </div>
    </AppShell>
  );
}
