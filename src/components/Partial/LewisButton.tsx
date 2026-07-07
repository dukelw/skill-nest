import { Button } from "~/components/ui/primitives";
import type React from "react";

type LewisButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
  href?: string;
  size?: string;
  lewisSize?: "small" | "medium" | "large" | "full";
  color?: "green" | "pink" | "blue" | "red" | "orange" | "yellow" | "black";
  variant?: "contained" | "outlined";
  hoverColor?: string;
  space?: boolean;
};

const sizeClasses = {
  xsmall: "text-[13px] min-w-10",
  small: "text-[14px] min-w-16",
  medium: "text-[15px] min-w-24",
  large: "text-[15px] min-w-32",
  full: "w-full",
};

const spacePadding = {
  small: "px-3 py-1.5",
  medium: "px-4 py-2",
  large: "px-5 py-2.5",
  full: "",
};

const getColorClasses = (
  color: string,
  variant: "contained" | "outlined",
  hoverColor: string
) => {
  if (variant === "outlined") {
    return `border border-emerald-200 text-emerald-800 bg-[#eef7ef] hover:bg-[#dcf5e2] hover:!bg-[#dcf5e2]`;
  }

  if (color === "black") {
    return "bg-[#111827] text-white hover:bg-[#0b1220] hover:!bg-[#0b1220] focus:ring-slate-300";
  }

  if (color === "red") {
    return "bg-red-600 text-white hover:bg-red-700 hover:!bg-red-700 focus:ring-red-200 shadow-red-900/10 hover:shadow-red-900/15";
  }

  if (color === "blue") {
    return "bg-sky-600 text-white hover:bg-sky-700 hover:!bg-sky-700 focus:ring-sky-200 shadow-sky-900/10 hover:shadow-sky-900/15";
  }

  if (color === "pink") {
    return "bg-rose-600 text-white hover:bg-rose-700 hover:!bg-rose-700 focus:ring-rose-200 shadow-rose-900/10 hover:shadow-rose-900/15";
  }

  if (color === "orange") {
    return "bg-orange-600 text-white hover:bg-orange-700 hover:!bg-orange-700 focus:ring-orange-200 shadow-orange-900/10 hover:shadow-orange-900/15";
  }

  if (color === "yellow") {
    return "bg-amber-500 text-slate-950 hover:bg-amber-400 hover:!bg-amber-400 focus:ring-amber-200 shadow-amber-900/10 hover:shadow-amber-900/15";
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
  size: _size,
  ...props
}: LewisButtonProps) => {
  return (
    <Button
      {...props}
      color="none"
      className={`focus:outline-none focus:ring-2 font-semibold cursor-pointer rounded-lg shadow-sm shadow-emerald-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-900/15 
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
