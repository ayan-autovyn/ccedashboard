import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Trophy, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { pct } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ccm")({
  head: () => ({
    meta: [
      { title: "Team Dashboard — CCM | Telecaller Desk" },
      { name: "description", content: "Call center manager view of every telecaller's daily calling target, progress and results." },
      { property: "og:title", content: "Team Dashboard — CCM | Telecaller Desk" },
      { property: "og:description", content: "Track every telecaller's daily calling target, progress and results." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CcmPage,
});

const L = {
  title: { en: "Team Dashboard", hi: "टीम डैशबोर्ड" },
  sub: { en: "See how every telecaller is doing today and who needs help.", hi: "देखें आज हर टेलीकॉलर का काम कैसा चल रहा है और किसे मदद चाहिए।" },
  team: { en: "Telecallers", hi: "टेलीकॉलर" },
  target: { en: "Team target", hi: "टीम टारगेट" },
  done: { en: "Calls done", hi: "कॉल पूरी" },
  remaining: { en: "Calls remaining", hi: "बाकी कॉल" },
  connected: { en: "Connected", hi: "बात हुई" },
  booked: { en: "Appointments booked", hi: "अपॉइंटमेंट बुक" },
  confirmed: { en: "Confirmed", hi: "कन्फर्म" },
  needHelp: { en: "Needs attention", hi: "ध्यान दें" },
  behind: { en: "is behind target", hi: "टारगेट से पीछे है" },
  allGood: { en: "Everyone is on track", hi: "सभी सही राह पर हैं" },
  top: { en: "Top performer", hi: "सबसे अच्छा प्रदर्शन" },
  name: { en: "Telecaller", hi: "टेलीकॉलर" },
  dealer: { en: "Dealer", hi: "डीलर" },
  progress: { en: "Progress", hi: "प्रगति" },
  status: { en: "Status", hi: "स्थिति" },
  onTrack: { en: "On track", hi: "सही राह पर" },
  slow: { en: "Slow", hi: "धीमा" },
  behindS: { en: "Behind", hi: "पीछे" },
  all: { en: "All", hi: "सभी" },
  service: { en: "Service calls", hi: "सर्विस कॉल" },
  appt: { en: "Appointment calls", hi: "अपॉइंटमेंट कॉल" },
} as const;

// Sample team data until the real CRM is connected.
const team = [
  { name: "Jitendra Singh Chouhan", dealer: "TVS-MP-0912", sTarget: 40, sDone: 31, conn: 22, booked: 9, aTarget: 18, aDone: 16, conf: 12 },
  { name: "Pooja Sharma", dealer: "TVS-MP-0912", sTarget: 38, sDone: 35, conn: 27, booked: 12, aTarget: 20, aDone: 19, conf: 15 },
  { name: "Rahul Verma", dealer: "TVS-MP-0874", sTarget: 42, sDone: 14, conn: 9, booked: 3, aTarget: 16, aDone: 7, conf: 4 },
  { name: "Neha Patel", dealer: "TVS-MP-0874", sTarget: 35, sDone: 24, conn: 17, booked: 6, aTarget: 15, aDone: 11, conf: 8 },
  { name: "Amit Yadav", dealer: "TVS-MP-1021", sTarget: 40, sDone: 19, conn: 12, booked: 4, aTarget: 22, aDone: 10, conf: 6 },
  { name: "Sunita Rawat", dealer: "TVS-MP-1021", sTarget: 36, sDone: 30, conn: 21, booked: 8, aTarget: 14, aDone: 13, conf: 10 },
].map((m) => {
  const target = m.sTarget + m.aTarget;
  const done = m.sDone + m.aDone;
  const p = pct(done, target);
  return { ...m, target, done, p, status: p >= 70 ? "onTrack" : p >= 45 ? "slow" : "behindS" } as const;
});

const badge = { onTrack: "bg-success/15 text-success", slow: "bg-warning/15 text-warning", behindS: "bg-destructive/15 text-destructive" };
const bar = { onTrack: "bg-success", slow: "bg-warning", behindS: "bg-destructive" };

function CcmPage() {
  const { lang } = useI18n();
  const tx = (k: keyof typeof L) => L[k][lang];
  const dealers = ["all", ...new Set(team.map((m) => m.dealer))];
  const [d, setD] = useState("all");
  const rows = team.filter((m) => d === "all" || m.dealer === d).sort((a, b) => a.p - b.p);
  const sum = (k: "target" | "done" | "conn" | "booked" | "conf") => rows.reduce((s, m) => s + m[k], 0);
  const target = sum("target"), done = sum("done");
  const behind = rows.filter((m) => m.status === "behindS");
  const best = [...rows].sort((a, b) => b.p - a.p)[0];

  const kpis = [
    { k: "team", v: rows.length },
    { k: "target", v: target },
    { k: "done", v: `${done} (${pct(done, target)}%)` },
    { k: "remaining", v: target - done },
    { k: "connected", v: sum("conn") },
    { k: "booked", v: sum("booked") },
    { k: "confirmed", v: sum("conf") },
  ] as const;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold"><Users className="h-6 w-6 text-primary" />{tx("title")}</h1>
            <p className="text-sm text-muted-foreground">{tx("sub")}</p>
          </div>
          <div className="flex flex-wrap gap-1 rounded-full bg-card p-1 shadow-card">
            {dealers.map((x) => (
              <button key={x} onClick={() => setD(x)} className={cn("rounded-full px-3 py-1 text-sm font-semibold", d === x ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                {x === "all" ? tx("all") : x}
              </button>
            ))}
          </div>
        </div>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {kpis.map((x) => (
            <div key={x.k} className="rounded-2xl border bg-card p-4 shadow-card">
              <p className="text-xs font-semibold text-muted-foreground">{tx(x.k)}</p>
              <p className="mt-1 text-2xl font-extrabold text-primary">{x.v}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-4 shadow-card">
            <h2 className="mb-2 flex items-center gap-2 font-bold text-destructive"><AlertTriangle className="h-5 w-5" />{tx("needHelp")}</h2>
            {behind.length ? (
              <ul className="space-y-1 text-sm">
                {behind.map((m) => <li key={m.name}><b>{m.name}</b> {tx("behind")} — {m.done}/{m.target} ({m.p}%)</li>)}
              </ul>
            ) : <p className="flex items-center gap-2 text-sm font-semibold text-success"><CheckCircle2 className="h-4 w-4" />{tx("allGood")}</p>}
          </div>
          {best && (
            <div className="rounded-2xl border bg-card p-4 shadow-card">
              <h2 className="mb-2 flex items-center gap-2 font-bold text-success"><Trophy className="h-5 w-5" />{tx("top")}</h2>
              <p className="text-sm"><b>{best.name}</b> — {best.done}/{best.target} ({best.p}%)</p>
            </div>
          )}
        </section>

        <section className="overflow-x-auto rounded-2xl border bg-card shadow-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-secondary text-left text-xs text-muted-foreground">
              <tr>
                {(["name", "dealer", "service", "appt", "progress", "connected", "booked", "confirmed", "status"] as const).map((k) => <th key={k} className="px-4 py-3 font-semibold">{tx(k)}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.name} className="border-t">
                  <td className="px-4 py-3 font-semibold">{m.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.dealer}</td>
                  <td className="px-4 py-3">{m.sDone}/{m.sTarget}</td>
                  <td className="px-4 py-3">{m.aDone}/{m.aTarget}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted"><div className={cn("h-full", bar[m.status])} style={{ width: `${m.p}%` }} /></div>
                      <span className="font-bold">{m.p}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{m.conn} <span className="text-muted-foreground">({pct(m.conn, m.sDone)}%)</span></td>
                  <td className="px-4 py-3">{m.booked}</td>
                  <td className="px-4 py-3">{m.conf}</td>
                  <td className="px-4 py-3"><span className={cn("rounded-full px-2 py-1 text-xs font-bold", badge[m.status])}>{tx(m.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  );
}
