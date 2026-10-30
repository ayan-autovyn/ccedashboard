import { Search } from "lucide-react";
import { useI18n, type Key } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function ListTabs<T extends string>({ tabs, active, onChange, query, onQuery }: {
  tabs: { value: T; label: Key; count: number }[];
  active: T;
  onChange: (v: T) => void;
  query: string;
  onQuery: (q: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="rounded-t-2xl border bg-card">
      <div className="flex gap-1 overflow-x-auto p-2">
        {tabs.map((x) => (
          <button
            key={x.value}
            onClick={() => onChange(x.value)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition",
              active === x.value ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary",
            )}
          >
            {t(x.label)}
            <span className={cn("rounded-full px-2 text-xs", active === x.value ? "bg-primary-foreground/20" : "bg-muted")}>{x.count}</span>
          </button>
        ))}
      </div>
      <div className="relative border-t bg-header p-3">
        <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={t("search")}
          className="w-full max-w-md rounded-lg bg-card py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
  );
}

export const match = (q: string, ...f: string[]) => !q || f.some((x) => x.toLowerCase().includes(q.toLowerCase()));
