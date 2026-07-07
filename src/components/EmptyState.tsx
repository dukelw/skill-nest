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
    "inline-flex h-9 items-center justify-center rounded-lg bg-[#1e5028] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#257a35]";

  return (
    <section
      className={`relative overflow-hidden rounded-lg border border-[#dcf5e2] bg-white text-center shadow-sm ${
        compact ? "p-6" : "p-8 sm:p-10"
      }`}
    >
      <div className="absolute inset-0 bg-[#fbfdfb]" />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#f2fbf4] text-[#257a35]">
          <Icon className="h-7 w-7" />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[#257a35]">
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
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[#baeac6] bg-white px-4 text-sm font-semibold text-[#257a35] shadow-sm transition hover:bg-[#f2fbf4]"
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
