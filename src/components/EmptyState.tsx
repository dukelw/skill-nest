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
    "inline-flex h-10 items-center justify-center rounded-lg bg-[#1e5028] px-5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#257a35]";

  return (
    <section
      className={`relative overflow-hidden rounded-lg border border-[#dcf5e2] bg-[#f7fbf7] text-center shadow-sm ${
        compact
          ? "p-6"
          : "flex min-h-[calc(100vh-8rem)] items-center justify-center p-8 sm:p-10"
      }`}
    >
      <div className="absolute inset-0 bg-[#f2fbf4]" />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-[#dcf5e2] bg-[#eaf6ec] text-[#257a35]">
          <Icon className="h-7 w-7" />
        </div>
        <p className="mt-5 text-[13px] font-semibold uppercase tracking-wide text-[#257a35]">
          {eyebrow}
        </p>
        <h2 className="mt-2 max-w-3xl text-[26px] font-bold leading-tight text-[#10201d] sm:text-[30px]">
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-xl text-[15px] leading-7 text-slate-700">
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
                className="inline-flex h-10 items-center justify-center rounded-lg border border-[#baeac6] bg-[#eef7ef] px-5 text-[15px] font-semibold text-[#257a35] shadow-sm transition hover:bg-[#dcf5e2]"
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
