import { describe, expect, it } from "vitest";
import { appts, leads } from "./data";
import { callingProgress } from "./calling-progress";

describe("daily calling progress", () => {
  it("follows the six priorities with pending and no-show in one appointment group", () => {
    expect(callingProgress(leads, appts, {}, {}).groups.map((g) => [g.kind, g.bucket])).toEqual([
      ["appointment", "today"], ["appointment", "tomorrow"], ["appointment", "pending"],
      ["service", "today"], ["service", "followup"], ["service", "pending"],
    ]);
  });
  it("counts service and appointment results toward the assigned calling target", () => {
    const p = callingProgress(leads, appts, { L1000: "nonConnect" }, { A91300: true });
    expect(p.target).toBe(58);
    expect(p.done).toBe(2);
    expect(p.remaining).toBe(56);
    expect(p.groups[0]?.remaining).toBe(11);
  });
  it("moves focus to tomorrow after today's appointments are called", () => {
    const called = Object.fromEntries(appts.filter((a) => a.bucket === "today").map((a) => [a.id, true]));
    expect(callingProgress(leads, appts, {}, called).next?.bucket).toBe("tomorrow");
  });
  it("closes the target only after all assigned customers have a saved result", () => {
    const p = callingProgress(leads, appts, Object.fromEntries(leads.map((l) => [l.id, "nonConnect"])), Object.fromEntries(appts.map((a) => [a.id, true])));
    expect(p.done).toBe(58);
    expect(p.remaining).toBe(0);
    expect(p.percent).toBe(100);
    expect(p.next).toBeUndefined();
  });
});