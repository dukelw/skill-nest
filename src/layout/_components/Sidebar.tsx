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
            className={`group flex h-12 w-full items-center rounded-2xl px-3 text-sm font-semibold transition-all duration-200 ${
              isOpen ? "justify-start" : "justify-center"
            } ${
              isActive
                ? "bg-white text-emerald-900 shadow-lg shadow-emerald-950/15"
                : "text-emerald-50/86 hover:bg-white/10 hover:text-white"
            }`}
            onClick={onItemClick}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-white/6 text-emerald-50 group-hover:bg-white/12"
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
      className={`hidden h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#043a31]/95 text-white shadow-[0_24px_70px_rgba(3,47,39,0.26)] backdrop-blur-xl transition-all duration-300 md:flex ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className={`flex h-20 items-center ${isOpen ? "justify-between px-4" : "justify-center"}`}>
        <Link href="/" className={`flex items-center ${isOpen ? "gap-3" : "gap-0"}`}>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 shadow-inner shadow-white/10">
            <Image src="/logo-white.png" alt="Skill Nest" width={38} height={38} />
          </span>
          {isOpen && (
            <span className="text-lg font-bold leading-tight text-white">
              Skill Nest
            </span>
          )}
        </Link>
        {isOpen && (
          <button
            onClick={toggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white transition hover:bg-white/14"
            aria-label="Toggle sidebar"
          >
            <FaBars />
          </button>
        )}
      </div>

      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white transition hover:bg-white/14"
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>
      )}

      <nav className="flex-1 space-y-2 px-3 pb-5">{renderItems()}</nav>

      {isOpen && (
        <div className="m-3 rounded-3xl border border-white/10 bg-white/8 p-4">
          <p className="text-xs font-semibold uppercase text-emerald-100">
            Learning hub
          </p>
          <p className="mt-1 text-xs text-emerald-50/70">
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
          className="z-40 mt-[72px] w-72 bg-[#043a31]"
        >
          <div className="h-full bg-[#043a31] p-4">{renderItems(toggleSidebar)}</div>
        </Drawer>
      </div>
    </aside>
  );
};

export default Sidebar;
