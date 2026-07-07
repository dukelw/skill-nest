"use client";

import * as React from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { X } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button as ShadButton, type ButtonProps as ShadButtonProps } from "./button";
import { Input, type InputProps } from "./input";
import { Card as ShadCard } from "./card";
import { Checkbox as ShadCheckbox } from "./checkbox";
import { Label as ShadLabel } from "./label";

export type ButtonProps = Omit<ShadButtonProps, "size" | "color"> & {
  color?: string;
  pill?: boolean;
  href?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "default" | "icon";
};

export function Button({ color, variant, size, className, href, children, ...props }: ButtonProps) {
  const mappedVariant =
    variant ?? (color === "light" || color === "gray" ? "secondary" : "default");
  const mappedSize = size === "xs" ? "sm" : size === "md" || size === "xl" ? "default" : size;
  const colorClass =
    color === "red"
      ? "bg-red-600 text-white hover:bg-red-700 hover:text-white"
      : color === "blue"
        ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
        : "";
  const buttonClass = cn(colorClass, className);
  if (href) {
    return (
      <Link href={href} className={cn("inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all", mappedSize === "sm" ? "h-9 px-3" : "h-11 px-5", colorClass || "bg-[#0d5b49] text-white hover:bg-[#0a493b]", buttonClass)}>
        {children}
      </Link>
    );
  }
  return <ShadButton variant={mappedVariant} size={mappedSize} className={buttonClass} {...props}>{children}</ShadButton>;
}

export function Navbar({
  className,
  children,
  fluid: _fluid,
  ...props
}: React.HTMLAttributes<HTMLElement> & { fluid?: boolean }) {
  return (
    <nav className={cn("flex min-h-14 w-full items-center border-b border-slate-200 bg-white/95 px-4 text-slate-900 shadow-sm", className)} {...props}>
      {children}
    </nav>
  );
}

export function NavbarBrand({
  href,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLAnchorElement> & { href?: string }) {
  return (
    <Link href={href ?? "/"} className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </Link>
  );
}

export function NavbarCollapse({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("hidden items-center gap-3 md:flex", className)} {...props}>
      {children}
    </div>
  );
}

export function TextInput({
  color: _color,
  theme: _theme,
  ...props
}: InputProps & { color?: string; theme?: unknown }) {
  return <Input {...props} />;
}

export type TextInputProps = InputProps & { color?: string; theme?: unknown };
export type ButtonPropsAlias = ButtonProps;

export function Label(props: React.ComponentProps<typeof ShadLabel>) {
  return <ShadLabel {...props} />;
}

type CheckboxProps = Omit<React.ComponentProps<typeof ShadCheckbox>, "onChange"> & {
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  name?: string;
};

export function Checkbox({
  checked,
  onChange,
  onCheckedChange,
  className,
  name,
  ...props
}: CheckboxProps) {
  return (
    <ShadCheckbox
      checked={checked}
      onCheckedChange={(value) => {
        onCheckedChange?.(value);
        onChange?.({
          target: { checked: value === true, name, type: "checkbox" },
        } as React.ChangeEvent<HTMLInputElement>);
      }}
      className={className}
      {...props}
    />
  );
}

export function Spinner({ size = "md", className, ...props }: React.HTMLAttributes<HTMLDivElement> & { size?: string }) {
  const sizeClass = size === "xl" ? "h-10 w-10" : size === "lg" ? "h-8 w-8" : "h-5 w-5";
  return (
    <div
      className={cn("inline-block animate-spin rounded-full border-2 border-slate-200 border-t-emerald-700", sizeClass, className)}
      {...props}
    />
  );
}

export function Card({
  imgSrc,
  imgAlt,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { imgSrc?: string; imgAlt?: string }) {
  return (
    <ShadCard className={cn("overflow-hidden rounded-xl border-slate-200 shadow-sm", className)} {...props}>
      {imgSrc && <img src={imgSrc} alt={imgAlt ?? ""} className="h-44 w-full object-cover" />}
      <div className={cn(imgSrc && "p-4")}>{children}</div>
    </ShadCard>
  );
}

export function Badge({ className, children }: React.HTMLAttributes<HTMLSpanElement> & { color?: string; size?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800", className)}>
      {children}
    </span>
  );
}

export function Avatar({
  img,
  alt,
  rounded,
  size = "md",
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement> & { img?: string; alt?: string; rounded?: boolean; size?: string }) {
  const sizeClass = size === "xs" ? "h-6 w-6" : size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  return (
    <span className={cn("inline-flex items-center justify-center overflow-hidden bg-emerald-50 text-sm font-semibold text-emerald-800", sizeClass, rounded ? "rounded-full" : "rounded-lg", className)}>
      {img ? <img src={img} alt={alt ?? ""} className="h-full w-full object-cover" /> : children}
    </span>
  );
}

export function Modal({
  show,
  onClose,
  children,
}: {
  show?: boolean;
  onClose?: () => void;
  size?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={!!show} onOpenChange={(open) => !open && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-900 shadow-xl focus:outline-none">
          {children}
          <Dialog.Close className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ModalHeader({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Dialog.Title asChild>
      <div className={cn("border-b border-slate-200 bg-white px-5 py-4 pr-12 text-base font-semibold text-slate-950", className?.replace(/bg-\S+|text-white/g, ""))}>{children}</div>
    </Dialog.Title>
  );
}

export function ModalBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-5 text-slate-800", className)} {...props} />;
}

export function ModalFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4", className)} {...props} />;
}

export function Dropdown({
  label,
  renderTrigger,
  children,
  className,
}: {
  label?: React.ReactNode;
  renderTrigger?: () => React.ReactNode;
  children: React.ReactNode;
  className?: string;
  arrowIcon?: boolean;
  inline?: boolean;
  placement?: string;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {renderTrigger ? (
          renderTrigger()
        ) : (
          <button className={cn("inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950", className)}>
            {label}
          </button>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={8} className="z-50 min-w-44 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 text-slate-800 shadow-xl">
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function DropdownItem({
  href,
  onClick,
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement> & { href?: string }) {
  const content = (
    <span className={cn("flex w-full items-center rounded-md px-3 py-2 text-sm text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-900", className?.replace(/text-white|hover:bg-white/g, ""))}>
      {children}
    </span>
  );
  if (href) {
    return (
      <DropdownMenu.Item asChild>
        <Link href={href}>{content}</Link>
      </DropdownMenu.Item>
    );
  }
  return (
    <DropdownMenu.Item onSelect={(event) => {
      event.preventDefault();
      onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>);
    }}>
      {content}
    </DropdownMenu.Item>
  );
}

export function Breadcrumb({ className, children }: React.HTMLAttributes<HTMLElement>) {
  return <nav className={cn("text-sm text-slate-500", className)}>{children}</nav>;
}

export function BreadcrumbItem({ href, children }: { href?: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      {href ? <Link className="font-medium text-slate-600 hover:text-emerald-700" href={href}>{children}</Link> : <span>{children}</span>}
      <span className="mx-2 text-slate-300">/</span>
    </span>
  );
}

export function Tabs({
  children,
  onActiveTabChange,
  className,
}: {
  children: React.ReactNode;
  onActiveTabChange?: (index: number) => void;
  className?: string;
  theme?: unknown;
  "aria-label"?: string;
  style?: React.CSSProperties;
}) {
  const items = React.Children.toArray(children) as React.ReactElement<TabItemProps>[];
  const initial = Math.max(0, items.findIndex((item) => item.props.active));
  const [active, setActive] = React.useState(initial);
  return (
    <div className={className}>
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {items.map((item, index) => (
          <button
            key={item.key ?? index}
            className={cn(
              "rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold transition",
              active === index
                ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
            onClick={() => {
              setActive(index);
              onActiveTabChange?.(index);
            }}
          >
            {item.props.title}
          </button>
        ))}
      </div>
      <div className="pt-4">{items[active]}</div>
    </div>
  );
}

type TabItemProps = {
  active?: boolean;
  title?: React.ReactNode;
  children: React.ReactNode;
};

export function TabItem({ children }: TabItemProps) {
  return <>{children}</>;
}

export function Drawer({
  open,
  onClose,
  children,
  className,
  backdrop = true,
}: {
  open?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  backdrop?: boolean;
  position?: string;
}) {
  return (
    <Dialog.Root open={!!open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
      <Dialog.Portal>
        {backdrop && <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/40" />}
        <Dialog.Content className={cn("fixed left-0 top-0 z-50 h-full w-80 bg-white p-4 shadow-xl", className)}>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Select({
  value,
  onChange,
  children,
  className,
  color: _color,
  theme: _theme,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { color?: string; theme?: unknown }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={cn("h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100", className)}
      {...props}
    >
      {children}
    </select>
  );
}

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  color?: string;
  theme?: unknown;
};

export function Datepicker({
  value,
  onChange,
  className,
  ...props
}: {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <Input
      type="date"
      value={value ? value.toISOString().slice(0, 10) : ""}
      onChange={(event) => onChange?.(event.target.value ? new Date(event.target.value) : null)}
      className={className}
      {...(props as Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">)}
    />
  );
}

export type DatepickerProps = React.ComponentProps<typeof Datepicker>;

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full text-left text-sm", className)} {...props} />;
}
export function TableHead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500", className)} {...props} />;
}
export function TableBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}
export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-b border-slate-100", className)} {...props} />;
}
export function TableHeadCell({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("px-4 py-3 font-semibold", className)} {...props} />;
}
export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3", className)} {...props} />;
}
