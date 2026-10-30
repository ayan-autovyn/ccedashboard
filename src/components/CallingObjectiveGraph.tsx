import { useState } from "react";
import { CalendarCheck, Phone, ChevronRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APPOINTMENT_CALL_ORDER, APPOINTMENT_CALL_TARGET, CRITICAL_OF_TARGET, SERVICE_CALL_TARGET, OBJECTIVE_LEVELS, groupObjectives, callingObjective, type ObjectiveKind, type ObjectiveLevel, type ObjectivePath, type ObjectiveRow } from "@/lib/head-office-objectives";
import { cn } from "@/lib/utils";

const labels: Record<ObjectiveLevel, string> = { zone: "Zone", region: "Region", area: "Area", territory: "Territory", dealer: "Dealer" };
const fmt = (value: number) => value.toLocaleString("en-IN");

export function CallingObjectiveGraph({ rows }: { rows: ObjectiveRow[] }) {
  const [kind, setKind] = useState<ObjectiveKind>("service");
  const [level, setLevel] = useState<ObjectiveLevel>("zone");
  const [path, setPath] = useState<ObjectivePath>({});
  const service = kind === "service";
  const target = service ? SERVICE_CALL_TARGET : APPOINTMENT_CALL_TARGET;
  const groups = groupObjectives(rows, level, kind, path);
  const total = groups.reduce((v, g) => v + g.total, 0);
  const called = groups.reduce((v, g) => v + g.called, 0);
  const created = groups.reduce((v, g) => v + g.created, 0);
  const progress = callingObjective(total, called, target);
  type G = (typeof groups)[number];
  const series: { label: string; color: string; text: string; value: (g: G) => number }[] = service
    ? [
      { label: "Total Due Leads", color: "bg-call-due", text: "text-stat-blue", value: (g) => g.total },
      { label: "Calls Done", color: "bg-call-done", text: "text-stat-teal", value: (g) => g.called },
      { label: "Appointments Booked", color: "bg-stat-green", text: "text-stat-green", value: (g) => g.created },
    ]
    : [
      { label: "Total Appointments", color: "bg-call-due", text: "text-stat-blue", value: (g) => g.total },
      { label: "Confirmation Calls Done", color: "bg-call-done", text: "text-stat-teal", value: (g) => g.called },
      { label: "Cancelled", color: "bg-stat-rose", text: "text-stat-rose", value: (g) => g.cancelled },
      { label: "Rescheduled", color: "bg-stat-amber", text: "text-stat-amber", value: (g) => g.rescheduled },
      { label: "Reported", color: "bg-stat-violet", text: "text-stat-violet", value: (g) => g.reported },
    ];
  const sum = (fn: (g: G) => number) => groups.reduce((v, g) => v + fn(g), 0);
  const maxValue = Math.max(1, ...groups.flatMap((g) => series.map((x) => x.value(g))));
  const scaleStep = 10 ** Math.floor(Math.log10(maxValue));
  const scaleMax = Math.ceil(maxValue / scaleStep) * scaleStep;
  const colWidth = service ? 150 : 210;
  const changeLevel = (next: ObjectiveLevel) => {
    setLevel(next);
    setPath((cur) => Object.fromEntries(Object.entries(cur).filter(([key]) => OBJECTIVE_LEVELS.indexOf(key as ObjectiveLevel) < OBJECTIVE_LEVELS.indexOf(next))));
  };
  const drill = (id: string) => {
    const next = OBJECTIVE_LEVELS[OBJECTIVE_LEVELS.indexOf(level) + 1];
    if (!next) return;
    setPath((cur) => ({ ...cur, [level]: id }));
    setLevel(next);
  };
  return (
    <section aria-label="Calling objectives" className="mb-4 min-w-0 border-y border-t-2 border-t-stat-blue bg-card pb-2">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-performance-band px-3 py-2">
        <h2 className="flex items-center gap-2 text-sm font-extrabold"><BarChart3 className="h-4 w-4 text-stat-blue" />Calling Performance</h2>
        <div className="flex flex-wrap gap-1 rounded-lg border bg-card p-1" role="group" aria-label="Graph call type">
          <Button size="sm" variant={service ? "default" : "ghost"} aria-pressed={service} onClick={() => setKind("service")}><Phone />Service Reminder Calls</Button>
          <Button size="sm" variant={!service ? "default" : "ghost"} aria-pressed={!service} onClick={() => setKind("appointment")}><CalendarCheck />Appointment Confirmation Calls</Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-y px-3 py-1.5">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Graph hierarchy">
          {OBJECTIVE_LEVELS.map((key) => <Button key={key} size="sm" variant={level === key ? "secondary" : "ghost"} className={cn("font-semibold", level === key && "ring-1 ring-stat-blue/20")} aria-pressed={level === key} onClick={() => changeLevel(key)}>{labels[key]}</Button>)}
        </div>
        <span className="text-xs text-muted-foreground">{target}% calling target{!service && ` · ${APPOINTMENT_CALL_ORDER.join(" → ")}`}</span>
      </div>
      {Object.keys(path).length > 0 && <nav aria-label="Graph drill path" className="flex min-h-8 flex-wrap items-center gap-1 px-3 text-xs">
        <Button variant="ghost" size="sm" onClick={() => { setPath({}); setLevel("zone"); }}>All selected locations</Button>
        {OBJECTIVE_LEVELS.filter((key) => path[key]).map((key) => <span key={key} className="flex items-center gap-1"><ChevronRight className="h-3 w-3 text-muted-foreground" /><Button variant="ghost" size="sm" onClick={() => changeLevel(OBJECTIVE_LEVELS[OBJECTIVE_LEVELS.indexOf(key) + 1] ?? "dealer")}>{path[key]}</Button></span>)}
      </nav>}
      <div className="grid gap-2 px-3 py-2" style={{ gridTemplateColumns: `repeat(${series.length}, minmax(0, 1fr))` }}>
        {series.map((x, i) => { const v = sum(x.value); const base = i === 0 ? 0 : sum(series[i === 1 || x.label === "Reported" ? 0 : 1]!.value); return <div key={x.label} className="rounded-md border bg-card px-2.5 py-1.5">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground"><span className={cn("h-2.5 w-2.5 rounded-sm", x.color)} />{i + 1}. {x.label}</p>
          <p className="flex items-baseline gap-1.5"><strong className={cn("text-base tabular-nums", i === 1 && progress.critical ? "text-stat-rose" : x.text)}>{fmt(v)}</strong>{i > 0 && <span className="text-[10px] text-muted-foreground">{base ? Math.round(v / base * 100) : 0}% of {i === 1 || x.label === "Reported" ? (service ? "due" : "total") : "calls done"}</span>}</p>
        </div>; })}
      </div>
      {groups.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No locations in the selected range.</p> : <>
        <div className="flex items-center justify-between px-4 pb-1 pt-2"><p className="text-[11px] font-bold">{labels[level]} performance</p><p className="text-[10px] text-muted-foreground">Red Calls Done bar = under {CRITICAL_OF_TARGET}% of target</p></div>
        <div className="flex min-w-0 gap-2 px-4">
          <div aria-hidden className="relative mt-6 h-40 w-12 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
            {[0, 1, 2, 3, 4].map((tick) => <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${tick * 25}%` }}>{fmt(Math.round(scaleMax * (1 - tick / 4)))}</span>)}
          </div>
          <div className="min-w-0 flex-1 overflow-x-auto pb-2">
            <div className="relative pt-6" style={{ minWidth: `${groups.length * colWidth}px` }} aria-label={`${labels[level]} calling coverage graph`}>
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-6 h-40">
                {[0, 1, 2, 3, 4].map((tick) => <div key={tick} className={cn("absolute inset-x-0 border-t border-border/60", tick < 4 && "border-dashed")} style={{ top: `${tick * 25}%` }} />)}
              </div>
              <div className="grid" style={{ gridTemplateColumns: `repeat(${groups.length}, minmax(0, 1fr))` }}>
                {groups.map((group) => <div key={group.id} className={cn("group min-w-0 px-3 transition-colors", group.critical ? "bg-destructive/5 hover:bg-destructive/10" : "hover:bg-stat-blue/5")}>
                  <div role="img" aria-label={`${group.id}: ${series.map((x) => `${x.label} ${x.value(group)}`).join(", ")}${group.critical ? ", badly behind target" : ""}`} className="relative mx-auto flex h-40 items-end justify-center gap-1.5 pt-0">
                    {series.map((x, i) => { const v = x.value(group); const red = i === 1 && group.critical; return <div key={x.label} data-series={x.label} title={`${group.name} · ${x.label}: ${fmt(v)}`} className={cn("relative w-6 rounded-t-sm shadow-call-bar", red ? "bg-call-critical" : x.color)} style={{ height: `${v / scaleMax * 100}%` }}><span className={cn("absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold tabular-nums", red ? "text-destructive" : x.text)}>{fmt(v)}</span></div>; })}
                    <div title={`Target: ${fmt(group.targetCalls)} calls (${target}%)`} className="absolute inset-x-0 z-10 border-t-2 border-dashed border-stat-amber" style={{ bottom: `${group.targetCalls / scaleMax * 100}%` }}><span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-stat-amber" /></div>
                  </div>
                  <div className="min-h-16 pt-1.5 text-center">
                    {level !== "dealer" ? <Button variant="link" className={cn("h-auto max-w-full justify-center whitespace-normal p-0 text-center text-xs font-semibold", group.critical && "text-destructive")} aria-label={`Drill into ${group.id}`} onClick={() => drill(group.id)}>{group.critical && <span className="mr-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-destructive align-middle" />}{group.name}<ChevronRight className="shrink-0" /></Button> : <><p className={cn("text-xs font-semibold", group.critical && "text-destructive")}>{group.id}</p><p className="mt-1 break-words text-[10px] text-muted-foreground">{group.name}</p></>}
                    <p className={cn("mx-auto mt-1 w-fit text-[10px] font-bold tabular-nums", group.critical ? "text-destructive" : group.below ? "text-stat-amber" : "text-stat-green")}>{group.percent.toFixed(0)}% called</p>
                  </div>
                </div>)}
              </div>
            </div>
          </div>
        </div>
      </>}
    </section>
  );
}