"use client";

import { Pagination } from "flowbite-react";
import type { PaginationProps } from "flowbite-react";
import classNames from "classnames";

type LewisPaginationProps = PaginationProps;

export default function LewisPagination({
  className,
  ...props
}: LewisPaginationProps) {
  return (
    <Pagination
      className={classNames("pagination-wrapper", className)}
      theme={{
        base: "flex items-center -space-x-px text-sm",
        layout: {
          table: {
            base: "text-sm text-gray-700 dark:text-gray-400",
            span: "font-semibold text-gray-900 dark:text-white",
          },
        },
        pages: {
          base: "inline-flex items-center -space-x-px",
          previous: {
            base: "block px-3 py-2 ml-0 leading-tight text-green-600 bg-white border border-gray-300 rounded-l-lg hover:bg-green-50 hover:text-green-700",
            icon: "w-5 h-5",
          },
          next: {
            base: "block px-3 py-2 leading-tight text-green-600 bg-white border border-gray-300 rounded-r-lg hover:bg-green-50 hover:text-green-700",
            icon: "w-5 h-5",
          },
          selector: {
            base: classNames(
              "px-3 py-2 leading-tight border border-gray-300",
              "bg-white text-green-600",
              "hover:bg-green-50 hover:text-green-700",
              "transition-colors duration-150 ease-in-out"
            ),
            active: classNames(
              "bg-green-600 text-white",
              "hover:bg-green-600 hover:text-white",
              "!ring-0"
            ),
            disabled: "opacity-50 cursor-not-allowed",
          },
        },
      }}
      {...props}
    />
  );
}
