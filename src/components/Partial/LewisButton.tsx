import { Button, ButtonProps } from "flowbite-react";

type LewisButtonProps = ButtonProps & {
  lewisSize?: "small" | "medium" | "large" | "full";
  color?: "green" | "pink" | "blue" | "red" | "orange" | "yellow" | "black";
  variant?: "contained" | "outlined";
  hoverColor?: string;
  space?: boolean;
};

const sizeClasses = {
  xsmall: "text-sm min-w-12 max-w-24",
  small: "text-sm min-w-16 max-w-32",
  medium: "text-base min-w-32 max-w-48",
  large: "text-lg min-w-48 max-w-60",
  full: "w-full",
};

const spacePadding = {
  small: "px-3 py-1.5 me-2 mb-2",
  medium: "px-4 py-2 me-2 mb-2",
  large: "px-5 py-3 me-2 mb-2",
  full: "me-2 mb-2",
};

const getColorClasses = (
  color: string,
  variant: "contained" | "outlined",
  hoverColor: string
) => {
  if (variant === "outlined") {
    return `border border-emerald-200 text-emerald-800 bg-white/80 hover:bg-emerald-50 hover:!bg-emerald-50`;
  }

  if (color === "black") {
    return "bg-[#111827] text-white hover:bg-[#0b1220] hover:!bg-[#0b1220] focus:ring-slate-300";
  }

  return `bg-[#0d5b49] text-white hover:bg-[#0a493b] hover:!bg-[#0a493b] focus:ring-emerald-200`;
};

const LewisButton = ({
  children,
  lewisSize = "medium",
  color = "green",
  variant = "contained",
  hoverColor = "dark-green",
  space = true,
  className = "",
  ...props
}: LewisButtonProps) => {
  return (
    <Button
      {...props}
      color="none"
      className={`focus:outline-none focus:ring-2 font-semibold cursor-pointer rounded-xl shadow-sm shadow-emerald-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/15 
        ${sizeClasses[lewisSize]} 
        ${space ? spacePadding[lewisSize] : ""} 
        ${getColorClasses(color, variant, hoverColor)} 
        ${className}`}
    >
      {children}
    </Button>
  );
};

export default LewisButton;
