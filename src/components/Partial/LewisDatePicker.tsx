"use client";

import { Datepicker, DatepickerProps } from "flowbite-react";

type LewisDatepickerProps = DatepickerProps & {
  themeColor?: string;
};

const LewisDatepicker = ({
  themeColor = "green",
  className = "",
  ...props
}: LewisDatepickerProps) => {
  return (
    <Datepicker
      {...props}
      className={className}
      showTodayButton
      showClearButton
      labelTodayButton="Today"
      labelClearButton="Clear"
      theme={{
        popup: {
          root: {
            base: `z-50 w-64 rounded-lg border border-gray-200 bg-${themeColor}-100 text-${themeColor}-700 shadow-md`,
            inline: "border-none shadow-none",
            inner: "p-2",
          },
          header: {
            base: "flex justify-between items-center px-2 py-1",
            title: `text-${themeColor}-800 font-semibold`,
            selectors: {
              base: "flex items-center space-x-1",
              button: {
                base: `hover:bg-${themeColor}-200 text-${themeColor}-700`,
                prev: "",
                next: "",
                view: "font-medium",
              },
            },
          },
          view: {
            base: "grid grid-cols-7 gap-1 text-center mt-2",
          },
          footer: {
            base: "flex justify-between items-center mt-2 px-2",
            button: {
              base: "rounded-md px-2 py-1 text-sm font-medium",
              today: `text-${themeColor}-700 hover:bg-${themeColor}-200`,
              clear: "text-red-600 hover:bg-red-100",
            },
          },
        },
      }}
    />
  );
};

export default LewisDatepicker;
