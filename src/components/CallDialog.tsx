import { Phone, X } from "lucide-react";
import { useI18n, type Key } from "@/lib/i18n";

export function CallDialog<T extends string>({
  name,
  mobile,
  options,
  onPick,
  onClose,
}: {
  name: string;
  mobile: string;
  options: { value: T; label: Key; tone: string }[];
  onPick: (v: T) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">{t("callingNow")}</p>
            <p className="text-xl font-extrabold">{name}</p>
            <a href={`tel:${mobile}`} className="mt-1 inline-flex items-center gap-2 text-primary font-semibold">
              <Phone className="h-4 w-4" /> {mobile}
            </a>
          </div>
          <button onClick={onClose} aria-label={t("cancel")} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-6 mb-3 text-sm font-bold">{t("whatHappened")}</p>
        <div className="grid grid-cols-2 gap-2">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => onPick(o.value)}
              className={`rounded-xl border-2 px-3 py-3 text-sm font-bold transition hover:bg-muted ${o.tone}`}
            >
              {t(o.label)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
