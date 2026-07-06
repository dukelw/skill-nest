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
            "block w-full border focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50 border-gray-300 bg-gray-50 text-color placeholder-gray-500 focus:border-green-500 focus:ring-green-500 p-2.5 text-sm rounded-lg",
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
