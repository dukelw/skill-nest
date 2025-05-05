import { Button, ButtonProps } from "flowbite-react";

type LewisButtonProps = ButtonProps & {
  lewisSize?: "small" | "medium" | "large" | "full";
  color?: "green" | "pink" | "blue" | "red" | "orange" | "yellow";
  variant?: "contained" | "outlined";
  hoverColor?: string;
};

const sizeClasses = {
  small: "text-sm px-3 py-1.5 min-w-16 max-w-32",
  medium: "text-base px-4 py-2 min-w-32 max-w-48",
  large: "text-lg px-5 py-3 min-w-48 max-w-60",
  full: "w-full",
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
  className = "",
  ...props
}: LewisButtonProps) => {
  return (
    <Button
      {...props}
      color="none"
      className={`focus:outline-none focus:ring-2 hover:opacity-90 font-medium rounded-lg me-2 mb-2 transition-all duration-200 
        ${sizeClasses[lewisSize]} 
        ${getColorClasses(color, variant, hoverColor)} 
        ${className}`}
    >
      {children}
    </Button>
  );
};

export default LewisButton;
