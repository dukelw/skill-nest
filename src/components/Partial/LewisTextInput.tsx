import { TextInput, TextInputProps } from "flowbite-react";

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
