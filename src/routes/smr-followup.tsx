import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Phone, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { CallDialog } from "@/components/CallDialog";
import { ListTabs, match } from "@/components/ListTabs";
import { leads, type FollowupTab, type Lead } from "@/lib/data";
import { useI18n, type Key } from "@/lib/i18n";
import { useStore, type Outcome } from "@/lib/store";

const tabs = ["total", "today", "pending", "followup", "reported", "lost"] as const;

export const Route = createFileRoute("/smr-followup")({
  validateSearch: z.object({ tab: z.enum(tabs).catch("total").default("total") }),
  head: () => ({
    meta: [
      { title: "Service Follow-up Calling List — Telecaller Desk" },
      { name: "description", content: "Customers due for service: call, log the outcome and book appointments." },
      { property: "og:title", content: "Service Follow-up Calling List" },
      { property: "og:description", content: "Call customers whose service is due and book appointments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Followup,
});

const labels: Record<FollowupTab, Key> = { total: "totalCalls", today: "todaysDue", pending: "pendingDue", followup: "followupTab", reported: "reportedCalls", lost: "lostCalls" };
const outcomeOpts: { value: Outcome; label: Key; tone: string }[] = [
  { value: "apptBooked", label: "apptBooked", tone: "border-success text-success" },
  { value: "callLater", label: "callLater", tone: "border-info text-info" },
  { value: "nonConnect", label: "nonConnect", tone: "border-warning text-warning" },
  { value: "notInterested", label: "notInterested", tone: "border-slate text-slate" },
];

function Followup() {
  const { t } = useI18n();
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { leadOutcome, logLead } = useStore();
  const [q, setQ] = useState("");
  const [calling, setCalling] = useState<Lead | null>(null);

  const inTab = (l: Lead, x: FollowupTab) => (x === "total" ? !["reported", "lost"].includes(l.bucket) : l.bucket === x);
  const rows = leads.filter((l) => inTab(l, tab) && match(q, l.name, l.reg, l.mobile, l.frame));

  return (
    <AppShell>
      <Link to="/" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"><ArrowLeft className="h-4 w-4" />{t("back")}</Link>
      <h1 className="mb-4 text-2xl font-extrabold">{t("followup")}</h1>
      <ListTabs
        tabs={tabs.map((x) => ({ value: x, label: labels[x], count: leads.filter((l) => inTab(l, x)).length }))}
        active={tab}
        onChange={(v) => navigate({ search: { tab: v } })}
        query={q}
        onQuery={setQ}
      />
      <div className="overflow-x-auto rounded-b-2xl border border-t-0 bg-card shadow-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-secondary text-left text-xs uppercase text-secondary-foreground">
            <tr>
              {(["customer", "vehicle", "service", "lastVisit", "status", "action"] as Key[]).map((h) => <th key={h} className="px-4 py-3 font-bold">{t(h)}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => {
              const o = leadOutcome[l.id];
              return (
                <tr key={l.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3"><p className="font-bold uppercase text-primary">{l.name}</p><p className="text-xs text-muted-foreground">{l.mobile}</p></td>
                  <td className="px-4 py-3"><p className="font-semibold">{l.model}</p><p className="text-xs text-muted-foreground">{l.reg} · {l.frame}</p></td>
                  <td className="px-4 py-3"><p className="font-semibold">{l.service}</p><p className="text-xs text-muted-foreground">{t("dueDate")}: {l.dueDate}</p></td>
                  <td className="px-4 py-3">{l.lastVisit}</td>
                  <td className="px-4 py-3">
                    {o ? <span className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2 py-1 text-xs font-bold text-success"><CheckCircle2 className="h-3 w-3" />{t(o)}</span>
                      : <span className="rounded-md border-l-4 border-primary bg-secondary px-2 py-1 text-xs font-bold text-primary">{t("smrDue")}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setCalling(l)} className="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2 font-bold text-primary-foreground transition hover:opacity-90">
                      <Phone className="h-4 w-4" />{t("call")}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">{t("noRows")}</td></tr>}
          </tbody>
        </table>
      </div>
      {calling && (
        <CallDialog name={calling.name} mobile={calling.mobile} options={outcomeOpts} onClose={() => setCalling(null)}
          onPick={(o) => { logLead(calling.id, o); setCalling(null); }} />
      )}
    </AppShell>
  );
}
