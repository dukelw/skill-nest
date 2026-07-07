import { Select, SelectProps } from "~/components/ui/primitives";

type LewisSelectProps = SelectProps & {
  textColor?: "white" | "black" | "light" | "default";
};

const LewisSelect = ({ textColor = "default", ...props }: LewisSelectProps) => {
  const customSelectTheme = {
    field: {
      select: {
        base: "block w-full border focus:outline-none focus:ring-1 p-2.5 text-sm rounded-lg",
        colors: {
          light: "!text-color dark:!text-gray-300",
          default:
            "block w-full border focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 border-emerald-100 bg-white/90 text-color placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-100 p-3 text-sm rounded-xl shadow-sm transition-all",
          white: "!text-white",
          black: "!text-black",
        },
      },
    },
  };

  return (
    <Select
      {...props}
      theme={{
        field: {
          select: {
            ...customSelectTheme.field.select,
            colors: {
              ...customSelectTheme.field.select.colors,
            },
          },
        },
      }}
      color={textColor}
    />
  );
};

export default LewisSelect;
