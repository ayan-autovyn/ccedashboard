import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Phone } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { CallDialog } from "@/components/CallDialog";
import { ListTabs, match } from "@/components/ListTabs";
import { type Appt, type ApptStatus, type ApptTab } from "@/lib/data";
import { useI18n, type Key } from "@/lib/i18n";
import { useStore, type ApptOutcome } from "@/lib/store";
import { cn } from "@/lib/utils";

const tabs = ["total", "today", "tomorrow", "pending", "reported", "lost"] as const;

export const Route = createFileRoute("/smr-appointments")({
  validateSearch: z.object({ tab: z.enum(tabs).catch("total").default("total") }),
  head: () => ({
    meta: [
      { title: "Appointment Calling List — Telecaller Desk" },
      { name: "description", content: "Call customers with upcoming appointments to confirm, reschedule or cancel." },
      { property: "og:title", content: "Appointment Calling List" },
      { property: "og:description", content: "Confirm today's and tomorrow's service appointments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Appointments,
});

const labels: Record<ApptTab, Key> = { total: "totalAppointment", today: "todayAppt", tomorrow: "tomorrowAppt", pending: "pendingAppt", reported: "reported", lost: "cancelled" };
const statusLabel: Record<ApptStatus, Key> = { pending: "pendingConfirmation", confirmed: "confirmed", rescheduled: "rescheduled", cancelled: "cancelled", reported: "reported" };
const statusTone: Record<ApptStatus, string> = { pending: "border-primary text-primary", confirmed: "border-success text-success", rescheduled: "border-info text-info", cancelled: "border-destructive text-destructive", reported: "border-warning text-warning" };
const opts: { value: ApptOutcome; label: Key; tone: string }[] = [
  { value: "confirmed", label: "confirm", tone: "border-success text-success" },
  { value: "rescheduled", label: "rescheduled", tone: "border-info text-info" },
  { value: "cancelled", label: "cancelled", tone: "border-destructive text-destructive" },
  { value: "nonConnect", label: "nonConnect", tone: "border-warning text-warning" },
];

function Appointments() {
  const { t } = useI18n();
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { appts, logAppt } = useStore();
  const [q, setQ] = useState("");
  const [calling, setCalling] = useState<Appt | null>(null);

  const inTab = (a: Appt, x: ApptTab) =>
    x === "lost" ? a.status === "cancelled"
      : x === "total" ? ["today", "pending", "tomorrow"].includes(a.bucket) && a.status !== "cancelled"
      : a.bucket === x && a.status !== "cancelled";
  const rows = appts.filter((a) => inTab(a, tab) && match(q, a.name, a.reg, a.mobile, a.id));

  return (
    <AppShell>
      <Link to="/" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"><ArrowLeft className="h-4 w-4" />{t("back")}</Link>
      <h1 className="mb-4 text-2xl font-extrabold">{t("appointments")}</h1>
      <ListTabs
        tabs={tabs.map((x) => ({ value: x, label: labels[x], count: appts.filter((a) => inTab(a, x)).length }))}
        active={tab}
        onChange={(v) => navigate({ search: { tab: v } })}
        query={q}
        onQuery={setQ}
      />
      <div className="overflow-x-auto rounded-b-2xl border border-t-0 bg-card shadow-card">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-secondary text-left text-xs uppercase text-secondary-foreground">
            <tr>{(["customer", "status", "vehicle", "service", "apptTime", "action"] as Key[]).map((h) => <th key={h} className="px-4 py-3 font-bold">{t(h)}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-t hover:bg-muted/50">
                <td className="px-4 py-3"><p className="font-bold uppercase text-primary">{a.name}</p><p className="text-xs text-muted-foreground">{a.mobile} · #{a.id}</p></td>
                <td className="px-4 py-3"><span className={cn("rounded-md border-l-4 bg-background px-2 py-1 text-xs font-bold", statusTone[a.status])}>{t(statusLabel[a.status])}</span></td>
                <td className="px-4 py-3"><p className="font-semibold">{a.model}</p><p className="text-xs text-muted-foreground">{a.reg}</p></td>
                <td className="px-4 py-3"><p className="font-semibold">{a.service}</p><p className="text-xs text-muted-foreground">{a.voc}</p></td>
                <td className="px-4 py-3 font-semibold">{a.apptTime}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setCalling(a)} className="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2 font-bold text-primary-foreground transition hover:opacity-90">
                    <Phone className="h-4 w-4" />{t("call")}
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">{t("noRows")}</td></tr>}
          </tbody>
        </table>
      </div>
      {calling && (
        <CallDialog name={calling.name} mobile={calling.mobile} options={opts} onClose={() => setCalling(null)}
          onPick={(o) => { logAppt(calling.id, o); setCalling(null); }} />
      )}
    </AppShell>
  );
}
