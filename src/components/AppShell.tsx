import { Link, useRouterState } from "@tanstack/react-router";
import { Building2, Users, CalendarCheck, LayoutGrid, PhoneCall, PhoneOff, Phone, CalendarPlus, Clock, XCircle, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { agent, dealer, leads } from "@/lib/data";
import { useReport, useStore } from "@/lib/store";
import { callingProgress } from "@/lib/calling-progress";
import { ArrowRight, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex shrink-0 rounded-full bg-primary-foreground/15 p-1 text-sm font-semibold">
      {(["en", "hi"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            "rounded-full px-3 py-1 transition",
            lang === l ? "bg-card text-primary shadow" : "text-primary-foreground/85 hover:text-primary-foreground",
          )}
        >
          {l === "en" ? "English" : "हिंदी"}
        </button>
      ))}
    </div>
  );
}

const nav = [
  { to: "/", icon: LayoutGrid, key: "dashboard" },
  { to: "/smr-followup", icon: PhoneCall, key: "followup" },
  { to: "/smr-appointments", icon: CalendarCheck, key: "appointments" },
  { to: "/ccm", icon: Users, key: "ccm" },
  { to: "/head-office", icon: Building2, key: "headOffice" },
] as const;

export function AppShell({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHeadOffice = pathname.startsWith("/head-office");
  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className={cn("sticky top-0 hidden h-screen w-20 shrink-0 flex-col items-center gap-3 border-r bg-card py-5 md:flex", compact && "desk-sidebar")}>
        <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary text-xs font-black text-primary-foreground">TVS</div>
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            title={t(n.key)}
            activeOptions={{ exact: true }}
            className="grid h-11 w-11 place-items-center rounded-xl text-muted-foreground transition hover:bg-secondary hover:text-primary data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
          >
            <n.icon className="h-5 w-5" />
          </Link>
        ))}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className={cn("bg-header text-primary-foreground", compact && "desk-header")}>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 md:px-8">
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold">{isHeadOffice ? t("headOfficeView") : t("appName")}</p>
              {!isHeadOffice && (
                <p className="truncate text-xs opacity-80">
                  {dealer.code} · {dealer.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!isHeadOffice && <LangToggle />}
              <div className="hidden items-center gap-2 rounded-full bg-primary-foreground/15 py-1 pl-1 pr-4 sm:flex">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-card text-xs font-bold text-primary">JS</span>
                <span className="text-sm font-semibold">{agent}</span>
              </div>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="whitespace-nowrap rounded-full px-3 py-1 text-sm opacity-80 data-[status=active]:bg-card data-[status=active]:text-primary data-[status=active]:opacity-100">
                {t(n.key)}
              </Link>
            ))}
          </nav>
        </header>
        <main className={cn("mx-auto w-full max-w-[1400px] flex-1", compact ? "desk-main p-3 lg:p-4" : "p-4 md:p-8")}>{children}</main>
      </div>
    </div>
  );
}

export function ActivityStrip({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const a = useReport().activity;
  const { appts, leadOutcome, apptCalled } = useStore();
  const progress = callingProgress(leads, appts, leadOutcome, apptCalled);
  const items = [
    { k: "attempts", v: progress.done, icon: Phone, c: "text-primary border-l-primary" },
    { k: "connected", v: a.connected, icon: CheckCircle2, c: "text-success border-l-success" },
    { k: "nonConnect", v: a.nonConnect, icon: PhoneOff, c: "text-warning border-l-warning" },
    { k: "apptBooked", v: a.apptBooked, icon: CalendarPlus, c: "text-destructive border-l-destructive" },
    { k: "callLater", v: a.callLater, icon: Clock, c: "text-info border-l-info" },
    { k: "notInterested", v: a.notInterested, icon: XCircle, c: "text-slate border-l-slate" },
  ] as const;
  return (
    <section className={cn("border bg-card", compact ? "desk-activity rounded-lg p-2" : "rounded-2xl p-4 shadow-card")}>
      <h2 className={cn("flex items-center gap-2 text-sm font-bold", compact ? "mb-1 text-primary" : "mb-3")}>{compact && <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />}{t("todayActivity")}</h2>
      <div className={cn(compact ? "desk-activity-body" : "mb-4 grid gap-4 border-b pb-4 sm:grid-cols-2")}>
      <div className={cn(compact ? "desk-target-focus" : "contents")}>
        <div>
          <div className="flex items-center gap-2 text-sm font-bold">{!compact && <Target className="h-4 w-4 text-primary" />}{t("dailyTarget")}</div>
          <div className={cn("flex items-end justify-between gap-3", compact ? "mt-1" : "mt-3")}>
            <p><span className={cn("font-extrabold text-primary", compact ? "text-2xl" : "text-3xl")}>{progress.done}</span><span className="ml-1 text-base text-muted-foreground">/ {progress.target}</span></p>
            <span className="text-xl font-bold text-primary">{progress.percent}%</span>
          </div>
          <div role="progressbar" aria-label={t("dailyTarget")} aria-valuenow={progress.done} aria-valuemin={0} aria-valuemax={progress.target} className={cn("overflow-hidden rounded-full bg-muted", compact ? "mt-1 h-1.5" : "mt-2 h-3")}>
            <div className="h-full bg-primary transition-all" style={{ width: `${progress.percent}%` }} />
          </div>
          <p className={cn("font-semibold", compact ? "mt-1 text-xs" : "mt-2 text-sm")}>{progress.remaining > 0 ? `${progress.remaining} ${t("remainingCalls")}` : t("targetClosed")}</p>
        </div>
        {progress.next ? <div className={cn(compact ? "border-l-2 border-primary bg-secondary/60 px-3" : "border-l-4 border-primary bg-secondary p-4")}>
          <p className="text-xs font-bold uppercase text-primary">{t("focusNow")}</p>
          <h3 className={cn("mt-1 font-extrabold", compact ? "text-sm" : "text-base")}>{t(progress.next.label)}</h3>
          <p className={cn("font-semibold", compact ? "mt-1 text-xs" : "mt-2 text-sm")}>{progress.next.remaining} {t("callsToMake")}</p>
          <p className={cn("mt-1 text-muted-foreground", compact ? "text-xs" : "text-sm")}>{t("afterGroup")}: {progress.remaining - progress.next.remaining} {t("remainingCalls")}</p>
          {compact ? <Button asChild size="sm" className="desk-start-calling shrink-0 border border-primary-deep font-bold shadow-card">
            <Link to={progress.next.to} search={{ tab: progress.next.bucket }}><PhoneCall aria-hidden="true" />{t("startCalling")}<ArrowRight aria-hidden="true" /></Link>
          </Button> : <Link to={progress.next.to} search={{ tab: progress.next.bucket }} className="mt-3 inline-flex items-center gap-2 font-bold text-primary">{t("startCalling")}<ArrowRight className="h-4 w-4" /></Link>}
        </div> : <div className="flex items-center gap-3 bg-success/10 p-4 font-bold text-success"><CheckCircle2 className="h-6 w-6" />{t("targetClosed")}</div>}
      </div>
      <div className={cn("grid", compact ? "desk-activity-counts grid-cols-3 gap-x-3 gap-y-2" : "grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6")}>
        {items.map((i) => (
          <div key={i.k} className={cn(compact ? "desk-activity-count min-w-0" : "rounded-xl border border-l-4 bg-background p-3", !compact && i.c)}>
            <div className={cn(compact ? "flex min-w-0 items-center gap-1.5" : "flex items-center justify-between")}>
              <span className={cn("font-medium leading-snug text-muted-foreground", compact ? "text-xs" : "text-[11px]")}>{t(i.k)}</span>
              {!compact && <i.icon className="h-4 w-4" />}
            </div>
            <p className={cn("font-extrabold tabular-nums", compact ? "text-xl leading-tight" : "mt-1 text-2xl", compact && i.c)}>{i.v}</p>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
