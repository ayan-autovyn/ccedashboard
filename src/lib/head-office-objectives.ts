export const SERVICE_CALL_TARGET = 80;
export const APPOINTMENT_CALL_TARGET = 100;
export const APPOINTMENT_CALL_ORDER = ["Today", "Tomorrow", "Pending / No-show"] as const;

export type DateRange = { from: string; to: string };

export const OBJECTIVE_LEVELS = ["zone", "region", "area", "territory", "dealer"] as const;
export type ObjectiveLevel = (typeof OBJECTIVE_LEVELS)[number];
export type ObjectiveKind = "service" | "appointment";
export type ObjectiveRow = Record<ObjectiveLevel, string> & {
  dealerName: string; due: number; done: number; created: number; appts: number; aDone: number;
  canc?: number; resched?: number; repWith?: number; repWithout?: number;
};
export type ObjectivePath = Partial<Record<ObjectiveLevel, string>>;

export function groupObjectives(rows: ObjectiveRow[], level: ObjectiveLevel, kind: ObjectiveKind, path: ObjectivePath = {}) {
  const groups = new Map<string, { id: string; name: string; total: number; called: number; created: number; cancelled: number; rescheduled: number; reported: number }>();
  for (const row of rows) {
    if (!OBJECTIVE_LEVELS.every((key) => !path[key] || path[key] === row[key])) continue;
    const id = row[level];
    const group = groups.get(id) ?? { id, name: level === "dealer" ? row.dealerName : id, total: 0, called: 0, created: 0, cancelled: 0, rescheduled: 0, reported: 0 };
    group.total += kind === "service" ? row.due : row.appts;
    group.called += kind === "service" ? row.done : row.aDone;
    group.created += row.created;
    group.cancelled += row.canc ?? 0;
    group.rescheduled += row.resched ?? 0;
    group.reported += (row.repWith ?? 0) + (row.repWithout ?? 0);
    groups.set(id, group);
  }
  return [...groups.values()].sort((a, b) => a.id.localeCompare(b.id)).map((group) => ({
    ...group,
    ...callingObjective(group.total, group.called, kind === "service" ? SERVICE_CALL_TARGET : APPOINTMENT_CALL_TARGET),
  }));
}

export function rangeDays(range: DateRange): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(range.from) || !/^\d{4}-\d{2}-\d{2}$/.test(range.to)) return 0;
  const start = Date.parse(`${range.from}T00:00:00Z`);
  const end = Date.parse(`${range.to}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0;
  return Math.floor((end - start) / 86400000) + 1;
}

/** Sample reporting volume only; actual dated reporting is not connected. */
export function sampleRangeFactor(range: DateRange): number {
  const days = rangeDays(range);
  const start = Date.parse(`${range.from}T00:00:00Z`) / 86400000;
  let factor = 0;
  for (let i = 0; i < days; i++) factor += 0.9 + ((start + i) % 7) * 0.025;
  return factor;
}

/** Done calls under this share of the required calls count as badly behind. */
export const CRITICAL_OF_TARGET = 60;

export function callingObjective(total: number, called: number, targetPercent: number) {
  const targetCalls = Math.ceil(total * targetPercent / 100);
  return {
    targetCalls,
    percent: total > 0 ? called / total * 100 : 0,
    remaining: Math.max(0, targetCalls - called),
    below: total > 0 && called < targetCalls,
    critical: total > 0 && called < (targetCalls * CRITICAL_OF_TARGET) / 100,
  };
}