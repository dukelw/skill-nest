import LewisButton from "./LewisButton";
import type React from "react";

type LoadingButtonProps = React.ComponentProps<typeof LewisButton> & {
  loading?: boolean;
  loadingText?: string;
};

export default function LoadingButton({
  children,
  loading = false,
  loadingText,
  disabled,
  className = "",
  ...props
}: LoadingButtonProps) {
  return (
    <LewisButton
      {...props}
      disabled={disabled || loading}
      className={`relative overflow-hidden disabled:cursor-wait ${className}`}
    >
      {loading && (
        <span className="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
      )}
      <span>{loading ? loadingText || children : children}</span>
    </LewisButton>
  );
}
