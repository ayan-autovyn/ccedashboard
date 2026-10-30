import { describe, expect, it } from "vitest";
import { APPOINTMENT_CALL_ORDER, APPOINTMENT_CALL_TARGET, SERVICE_CALL_TARGET, OBJECTIVE_LEVELS, groupObjectives, callingObjective, rangeDays, sampleRangeFactor } from "./head-office-objectives";

describe("Head Office calling objectives", () => {
  it("requires 80% of total service due, rounding up to a whole customer", () => {
    expect(SERVICE_CALL_TARGET).toBe(80);
    expect(callingObjective(103, 82, SERVICE_CALL_TARGET)).toMatchObject({ targetCalls: 83, remaining: 1, below: true });
    expect(callingObjective(103, 83, SERVICE_CALL_TARGET).below).toBe(false);
  });
  it("requires calls to 100% of appointments, not a customer confirmation quota", () => {
    expect(APPOINTMENT_CALL_TARGET).toBe(100);
    expect(callingObjective(100, 99, APPOINTMENT_CALL_TARGET)).toMatchObject({ remaining: 1, below: true });
    expect(callingObjective(100, 100, APPOINTMENT_CALL_TARGET).below).toBe(false);
  });
  it("prioritizes today, then tomorrow, then pending/no-show appointments", () => {
    expect(APPOINTMENT_CALL_ORDER).toEqual(["Today", "Tomorrow", "Pending / No-show"]);
  });
  it("includes both dates in a range", () => {
    expect(rangeDays({ from: "2026-10-29", to: "2026-10-30" })).toBe(2);
    expect(rangeDays({ from: "2026-10-30", to: "2026-10-30" })).toBe(1);
    expect(rangeDays({ from: "2026-10-31", to: "2026-10-30" })).toBe(0);
  });
  it("adds sample data for each selected day", () => {
    const full = sampleRangeFactor({ from: "2026-10-29", to: "2026-10-30" });
    expect(full).toBeCloseTo(sampleRangeFactor({ from: "2026-10-29", to: "2026-10-29" }) + sampleRangeFactor({ from: "2026-10-30", to: "2026-10-30" }));
  });
  it("flags a location as critical once it is under 60% of the required calls", () => {
    // 100 due, target 80 calls: 47 done is under 48 (60% of 80) -> critical.
    expect(callingObjective(100, 47, SERVICE_CALL_TARGET).critical).toBe(true);
    expect(callingObjective(100, 48, SERVICE_CALL_TARGET).critical).toBe(false);
    expect(callingObjective(100, 79, SERVICE_CALL_TARGET)).toMatchObject({ below: true, critical: false });
    // Appointment objective is 100 of 100: 59 done is critical, 60 is only below.
    expect(callingObjective(100, 59, APPOINTMENT_CALL_TARGET).critical).toBe(true);
    expect(callingObjective(100, 60, APPOINTMENT_CALL_TARGET)).toMatchObject({ below: true, critical: false });
    expect(callingObjective(0, 0, SERVICE_CALL_TARGET).critical).toBe(false);
  });
});

describe("Hierarchical objective graphs", () => {
  const rows = [
    { zone: "North", region: "North 1", area: "A", territory: "T1", dealer: "D1", dealerName: "One", due: 100, done: 80, created: 20, appts: 40, aDone: 30 },
    { zone: "North", region: "North 1", area: "A", territory: "T2", dealer: "D2", dealerName: "Two", due: 300, done: 180, created: 30, appts: 60, aDone: 50 },
    { zone: "East", region: "East 1", area: "B", territory: "T3", dealer: "D3", dealerName: "Three", due: 100, done: 90, created: 25, appts: 10, aDone: 10 },
  ];
  it("compares all five requested hierarchy levels", () => {
    expect(OBJECTIVE_LEVELS).toEqual(["zone", "region", "area", "territory", "dealer"]);
    expect(OBJECTIVE_LEVELS.map((level) => groupObjectives(rows, level, "service").length)).toEqual([2, 2, 2, 3, 3]);
  });
  it("uses summed calling volumes, not an average of dealer percentages", () => {
    expect(groupObjectives(rows, "zone", "service").find((g) => g.id === "North")).toMatchObject({ total: 400, called: 260, percent: 65, targetCalls: 320, remaining: 60, created: 50 });
  });
  it("switches to appointment calling against the 100% objective", () => {
    expect(groupObjectives(rows, "zone", "appointment").find((g) => g.id === "North")).toMatchObject({ total: 100, called: 80, percent: 80, targetCalls: 100, remaining: 20 });
  });
  it("drills only into the selected ancestors through dealer level", () => {
    const path = { zone: "North", region: "North 1", area: "A", territory: "T2" };
    expect(groupObjectives(rows, "dealer", "service", path).map((g) => g.id)).toEqual(["D2"]);
    expect(groupObjectives(rows, "region", "service", { zone: "East" }).map((g) => g.id)).toEqual(["East 1"]);
  });
});
import { groupObjectives as g2 } from "./head-office-objectives";
describe("appointment outcome series", () => {
  it("sums cancelled, rescheduled and reported per group", () => {
    const base = { zone: "N", region: "N1", area: "A", territory: "T", dealerName: "x", due: 10, done: 5, created: 2, appts: 10, aDone: 8 };
    const [grp] = g2([{ ...base, dealer: "D1", canc: 1, resched: 2, repWith: 3, repWithout: 1 }, { ...base, dealer: "D2", canc: 2, resched: 1, repWith: 1, repWithout: 0 }], "zone", "appointment");
    expect(grp).toMatchObject({ total: 20, called: 16, cancelled: 3, rescheduled: 3, reported: 5 });
  });
});
