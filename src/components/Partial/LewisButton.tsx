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
    return `border border-${color} text-${color} bg-transparent hover:bg-${hoverColor} hover:!bg-${hoverColor}`;
  }

  return `bg-${color} text-white hover:bg-${hoverColor} hover:!bg-${hoverColor} focus:ring-${color}-300`;
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
      className={`focus:outline-none focus:ring-2 hover:opacity-90 font-medium cursor-pointer rounded-lg transition-all duration-200 
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
