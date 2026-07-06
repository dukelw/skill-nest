import Link from "next/link";
import type { ElementType } from "react";
import { Sparkles } from "lucide-react";

type EmptyStateProps = {
  icon?: ElementType;
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  compact?: boolean;
};

export default function EmptyState({
  icon: Icon = Sparkles,
  eyebrow = "Empty workspace",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
  compact = false,
}: EmptyStateProps) {
  const actionClass =
    "inline-flex h-11 items-center justify-center rounded-2xl bg-[#0d5b49] px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0a493b] hover:shadow-md";

  return (
    <section
      className={`relative overflow-hidden rounded-[30px] border border-emerald-100 bg-white/88 text-center shadow-[0_22px_70px_rgba(8,55,45,0.1)] backdrop-blur ${
        compact ? "p-6" : "p-8 sm:p-10"
      }`}
    >
      <div className="absolute inset-0 bg-[#fbfcf8]" />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700 shadow-inner shadow-emerald-100">
          <Icon className="h-7 w-7" />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase text-emerald-700">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#10201d]">{title}</h2>
        {description && (
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        )}
        {(actionLabel || secondaryLabel) && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {actionLabel &&
              (actionHref ? (
                <Link href={actionHref} className={actionClass}>
                  {actionLabel}
                </Link>
              ) : (
                <button className={actionClass} onClick={onAction}>
                  {actionLabel}
                </button>
              ))}
            {secondaryLabel && secondaryHref && (
              <Link
                href={secondaryHref}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-emerald-100 bg-white/80 px-5 text-sm font-semibold text-emerald-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                {secondaryLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
