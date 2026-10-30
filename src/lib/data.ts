export type FollowupTab = "total" | "today" | "pending" | "followup" | "reported" | "lost";
export type ApptTab = "total" | "today" | "tomorrow" | "pending" | "reported" | "lost";
export type ApptStatus = "pending" | "confirmed" | "rescheduled" | "cancelled" | "reported";

export const dealer = { code: "TVS-MP-0912", name: "DUGAR DISTRIBUTORS PRIVATE LIMITED" };
export const agent = "Jitendra Singh Chouhan";

export interface Lead {
  id: string;
  name: string;
  mobile: string;
  model: string;
  frame: string;
  reg: string;
  service: string;
  dueDate: string;
  lastVisit: string;
  bucket: FollowupTab;
}

export interface Appt {
  id: string;
  name: string;
  mobile: string;
  model: string;
  reg: string;
  service: string;
  dueDate: string;
  apptTime: string;
  voc: string;
  bucket: ApptTab;
  status: ApptStatus;
}

const names = ["Anil Dangi", "Balram Patidar", "Shri Ram Mishra", "Suraj Patil", "Vijay Panwar", "Neha Sharma", "Rakesh Yadav", "Pooja Verma", "Mahesh Gupta", "Sunita Rathore", "Amit Joshi", "Kiran Solanki", "Deepak Malviya", "Rekha Jain", "Manoj Thakur", "Priya Chouhan"];
const models = ["TVS Apache RTR 160 4V", "TVS Ronin 2CH MID", "TVS Raider Disc", "TVS Ronin 1CH Base", "TVS Jupiter 110", "TVS NTORQ 125 Race", "TVS Radeon Drum"];
const services = ["Paid Service", "3rd Free Service", "4th Free Service", "5th Free Service"];
const fBuckets: FollowupTab[] = ["today", "today", "pending", "pending", "followup", "today", "reported", "lost"];
const aBuckets: ApptTab[] = ["today", "today", "tomorrow", "pending", "pending", "pending", "reported", "today"];
const vocs = ["No specific issue reported", "Light starting trouble in the morning", "Brake noise", "No specific issue reported"];

const pick = <T>(arr: T[], i: number): T => arr[i % arr.length] as T;

const mob = (i: number) => `98${(26000000 + i * 734121).toString().slice(0, 8)}`;
const reg = (i: number) => `MP09${["DX", "ZP", "AU", "UW", "AR"][i % 5]}${(1000 + i * 377) % 9000 + 1000}`;

export const leads: Lead[] = Array.from({ length: 40 }, (_, i) => ({
  id: `L${1000 + i}`,
  name: pick(names, i),
  mobile: mob(i),
  model: pick(models, i),
  frame: `MD637GE${56 + i}R2K0${4253 + i}`,
  reg: reg(i),
  service: pick(services, i),
  dueDate: `${String(1 + (i % 28)).padStart(2, "0")}-11-2026`,
  lastVisit: `${String(1 + (i % 27)).padStart(2, "0")}-0${1 + (i % 9)}-2026`,
  bucket: pick(fBuckets, i),
}));

export const appts: Appt[] = Array.from({ length: 32 }, (_, i) => {
  const bucket = pick(aBuckets, i);
  return {
    id: `A${91300 + i}`,
    name: pick(names, (i + 5)),
    mobile: mob(i + 50),
    model: pick(models, (i + 3)),
    reg: reg(i + 20),
    service: pick(services, (i + 1)),
    dueDate: `${String(10 + (i % 18)).padStart(2, "0")}-10-2026`,
    apptTime: `${bucket === "tomorrow" ? "30" : "29"}-10-2026 ${String(9 + (i % 8)).padStart(2, "0")}:30 AM`,
    voc: pick(vocs, i),
    bucket,
    status: bucket === "reported" ? "reported" : i % 7 === 0 ? "confirmed" : "pending",
  };
});
