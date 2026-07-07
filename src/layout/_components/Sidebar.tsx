"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Drawer } from "~/components/ui/primitives";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import staticSidebarItems from "~/static/SideBarItem";
import useIsMobile from "~/hooks/useIsMobile";

const Sidebar = ({
  isOpen,
  toggleSidebar,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
}) => {
  const sidebarItems = staticSidebarItems();
  const pathName = usePathname();
  const isMobile = useIsMobile();

  const renderItems = (onItemClick?: () => void) =>
    sidebarItems?.map((item: any, index: number) => {
      const Icon = item.icon;
      const isActive =
        item.href === "/" ? pathName === item.href : pathName.startsWith(item.href);

      return (
        <Link className="block" href={item.href} key={index}>
          <button
            className={`group flex min-h-10 w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-[14px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
              isOpen ? "justify-start" : "justify-center"
            } ${
              isActive
                ? "bg-transparent text-[#2b9a3d]"
                : "text-slate-500 hover:bg-[#f7faf8] hover:text-slate-900"
            }`}
            onClick={onItemClick}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
                isActive
                  ? "text-[#2b9a3d]"
                  : "text-slate-400 group-hover:text-[#2b9a3d]"
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            {isOpen && <span className="truncate">{item.label}</span>}
          </button>
        </Link>
      );
    });

  return (
    <aside
      className={`app-sidebar hidden h-screen flex-col overflow-hidden transition-all duration-300 md:flex ${
        isOpen ? "w-[320px]" : "w-[84px]"
      }`}
    >
      <div
        className={`flex h-16 shrink-0 items-center border-b border-slate-200 ${
          isOpen ? "justify-between px-5" : "justify-center"
        }`}
      >
        <Link href="/" className={`flex items-center ${isOpen ? "" : "justify-center"}`}>
          {isOpen ? (
            <Image
              src="/logo-big.png"
              alt="Skill Nest"
              width={250}
              height={82}
              className="h-14 w-[220px] object-contain object-left"
              priority
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-100 bg-[#eef7ef] shadow-sm">
              <Image src="/logo-small.png" alt="Skill Nest" width={34} height={34} />
            </span>
          )}
        </Link>
        {isOpen && (
          <button
            onClick={toggleSidebar}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-emerald-100 bg-[#eef7ef] text-slate-600 transition hover:bg-[#dcf5e2] hover:text-slate-900"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
      </div>

      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="mx-auto mt-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-emerald-100 bg-[#eef7ef] text-slate-600 transition hover:bg-[#dcf5e2] hover:text-slate-900"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}

      <nav className="flex-1 space-y-1 px-4 py-5">{renderItems()}</nav>

      {isOpen && (
        <div className="mx-4 mb-5 rounded-lg border border-[#dcf5e2] bg-[#f2fbf4] p-4">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-[#257a35]">
            Learning hub
          </p>
          <p className="mt-1 text-[13px] leading-6 text-slate-600">
            Organize classes, tasks, meetings, and courses in one flow.
          </p>
        </div>
      )}

      {isMobile && (
        <Drawer
          backdrop={false}
          open={isOpen}
          onClose={toggleSidebar}
          position="left"
          className="mt-16 w-72 bg-white"
        >
          <div className="h-full bg-white p-4">{renderItems(toggleSidebar)}</div>
        </Drawer>
      )}
    </aside>
  );
};

export default Sidebar;
