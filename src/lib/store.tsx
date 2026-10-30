import { createContext, useContext, useState, type ReactNode } from "react";
import { appts as seedAppts, leads, type Appt, type ApptStatus } from "./data";

export type Outcome = "connected" | "nonConnect" | "apptBooked" | "callLater" | "notInterested";
export type ApptOutcome = "confirmed" | "rescheduled" | "cancelled" | "nonConnect";

interface Store {
  leadOutcome: Record<string, Outcome>;
  appts: Appt[];
  apptCalled: Record<string, boolean>;
  logLead: (id: string, o: Outcome) => void;
  logAppt: (id: string, o: ApptOutcome) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [leadOutcome, setLead] = useState<Record<string, Outcome>>({});
  const [apptsState, setAppts] = useState<Appt[]>(seedAppts);
  const [apptCalled, setCalled] = useState<Record<string, boolean>>({});
  return (
    <Ctx.Provider
      value={{
        leadOutcome,
        appts: apptsState,
        apptCalled,
        logLead: (id, o) => setLead((s) => ({ ...s, [id]: o })),
        logAppt: (id, o) => {
          setCalled((s) => ({ ...s, [id]: true }));
          if (o !== "nonConnect")
            setAppts((list) => list.map((a) => (a.id === id ? { ...a, status: o as ApptStatus } : a)));
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("StoreProvider missing");
  return s;
}

/** Report numbers matching the daily CCE report sheets. */
export function useReport() {
  const { leadOutcome, appts, apptCalled } = useStore();
  const due = leads.filter((l) => l.bucket === "today" || l.bucket === "pending" || l.bucket === "followup");
  const outcomes = Object.values(leadOutcome);
  const callsDone = outcomes.length;
  const connected = outcomes.filter((o) => o !== "nonConnect").length;
  const apptCreated = outcomes.filter((o) => o === "apptBooked").length;

  const active = appts.filter((a) => ["today", "pending", "tomorrow"].includes(a.bucket));
  const reportedAll = appts.filter((a) => a.status === "reported");
  return {
    service: { due: due.length, callsDone, connected, apptCreated },
    appt: {
      total: active.length,
      callsDone: active.filter((a) => apptCalled[a.id]).length,
      confirmed: active.filter((a) => a.status === "confirmed").length,
      cancelled: active.filter((a) => a.status === "cancelled").length,
      reportedWith: reportedAll.filter((_, i) => i % 3 !== 0).length,
      reportedWithout: reportedAll.filter((_, i) => i % 3 === 0).length,
    },
    activity: {
      attempts: callsDone,
      connected,
      nonConnect: outcomes.filter((o) => o === "nonConnect").length,
      apptBooked: apptCreated,
      callLater: outcomes.filter((o) => o === "callLater").length,
      notInterested: outcomes.filter((o) => o === "notInterested").length,
    },
  };
}

export const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
