import { TextInput, TextInputProps } from "~/components/ui/primitives";

type LewisTextInputProps = TextInputProps & {
  textColor?: "white" | "black" | "light" | "default";
};

const LewisTextInput = ({
  textColor = "default",
  ...props
}: LewisTextInputProps) => {
  const customTextInputTheme = {
    field: {
      input: {
        base: "block w-full border focus:outline-none focus:ring-1 px-3 py-2 text-sm rounded-lg",
        colors: {
          light: "!text-color dark:!text-gray-300",
          default:
            "block w-full border focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 border-slate-200 bg-white text-color placeholder-gray-400 focus:border-emerald-600 focus:ring-emerald-100 px-3 py-2.5 text-sm rounded-lg shadow-sm transition-all",
          white: "!text-white",
          black: "!text-black",
        },
      },
    },
  };
  return (
    <TextInput
      {...props}
      theme={{
        field: {
          input: {
            ...customTextInputTheme.field.input,
            colors: {
              ...customTextInputTheme.field.input.colors,
            },
          },
        },
      }}
      color={textColor}
    />
  );
};

export default LewisTextInput;
