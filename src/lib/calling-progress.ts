import type { Appt, Lead } from "./data";

const priorities = [
  { kind: "appointment", bucket: "today", label: "todayAppt", impact: "impactToday", to: "/smr-appointments" },
  { kind: "appointment", bucket: "tomorrow", label: "tomorrowAppt", impact: "impactTomorrow", to: "/smr-appointments" },
  { kind: "appointment", bucket: "pending", label: "pendingAppt", impact: "impactPendingAppt", to: "/smr-appointments" },
  { kind: "service", bucket: "today", label: "todaysDue", impact: "impactService", to: "/smr-followup" },
  { kind: "service", bucket: "followup", label: "followupTab", impact: "impactFollowup", to: "/smr-followup" },
  { kind: "service", bucket: "pending", label: "pendingDue", impact: "impactPending", to: "/smr-followup" },
] as const;

/** Daily target is the assigned work, not an invented quota. One saved result per customer counts once. */
export function callingProgress(leads: Lead[], appts: Appt[], leadOutcome: Record<string, string>, apptCalled: Record<string, boolean>) {
  const groups = priorities.map((p) => {
    const rows = p.kind === "appointment" ? appts.filter((a) => a.bucket === p.bucket) : leads.filter((l) => l.bucket === p.bucket);
    const done = rows.filter((row) => p.kind === "appointment" ? apptCalled[row.id] : Boolean(leadOutcome[row.id])).length;
    return { ...p, total: rows.length, done, remaining: rows.length - done };
  });
  const target = groups.reduce((sum, group) => sum + group.total, 0);
  const done = groups.reduce((sum, group) => sum + group.done, 0);
  return { groups, target, done, remaining: target - done, percent: target ? Math.round(done / target * 100) : 100, next: groups.find((g) => g.remaining > 0) };
}