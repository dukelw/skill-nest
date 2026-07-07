"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Drawer } from "~/components/ui/primitives";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars } from "react-icons/fa";
import staticSidebarItems from "~/static/SideBarItem";

const Sidebar = ({
  isOpen,
  toggleSidebar,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
}) => {
  const sidebarItems = staticSidebarItems();
  const pathName = usePathname();

  const renderItems = (onItemClick?: () => void) =>
    sidebarItems?.map((item: any, index: number) => {
      const Icon = item.icon;
      const isActive =
        item.href === "/" ? pathName === item.href : pathName.startsWith(item.href);

      return (
        <Link className="block" href={item.href} key={index}>
          <button
            className={`group flex h-10 w-full cursor-pointer items-center rounded-lg px-3 text-sm font-semibold transition-colors ${
              isOpen ? "justify-start" : "justify-center"
            } ${
              isActive
                ? "bg-emerald-50 text-emerald-800"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
            onClick={onItemClick}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                isActive
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            {isOpen && <span className="ml-3 truncate">{item.label}</span>}
          </button>
        </Link>
      );
    });

  return (
    <aside
      className={`hidden h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm transition-all duration-300 md:flex ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className={`flex h-20 items-center ${isOpen ? "justify-between px-4" : "justify-center"}`}>
        <Link href="/" className={`flex items-center ${isOpen ? "gap-3" : "gap-0"}`}>
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 shadow-sm">
            <Image src="/logo.png" alt="Skill Nest" width={36} height={36} />
          </span>
          {isOpen && (
            <span className="text-lg font-bold leading-tight text-slate-950">
              Skill Nest
            </span>
          )}
        </Link>
        {isOpen && (
          <button
            onClick={toggleSidebar}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            aria-label="Toggle sidebar"
          >
            <FaBars />
          </button>
        )}
      </div>

      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="mx-auto mb-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>
      )}

      <nav className="flex-1 space-y-2 px-3 pb-5">{renderItems()}</nav>

      {isOpen && (
        <div className="m-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase text-emerald-800">
            Learning hub
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Organize classes, tasks, meetings, and courses in one flow.
          </p>
        </div>
      )}

      <div className="md:hidden">
        <Drawer
          backdrop={false}
          open={isOpen}
          onClose={toggleSidebar}
          position="left"
          className="z-40 mt-[72px] w-72 bg-white"
        >
          <div className="h-full bg-white p-4">{renderItems(toggleSidebar)}</div>
        </Drawer>
      </div>
    </aside>
  );
};

export default Sidebar;
