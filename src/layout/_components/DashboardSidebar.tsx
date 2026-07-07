"use client";

import { Drawer } from "~/components/ui/primitives";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import dashboardSidebarItems from "~/static/DashboardSideBarItem";
import adminSidebarItems from "~/static/AdminSideBarItem";
import { useAuthStore } from "~/store/authStore";
import { UserRole } from "~/models/UserRole";
import useIsMobile from "~/hooks/useIsMobile";

const Sidebar = ({
  isOpen,
  toggleSidebar,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
}) => {
  const { user } = useAuthStore();
  const sidebarItems =
    user?.role === UserRole.ADMIN
      ? adminSidebarItems()
      : dashboardSidebarItems();
  const pathName = usePathname();
  const isMobile = useIsMobile();
  return (
    <div
      className={`app-sidebar flex h-screen flex-col overflow-hidden transition-all duration-300 ${
        isOpen ? "w-[260px]" : "w-[84px]"
      }`}
    >
      <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-5">
      <button
        onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-[#f7faf8] hover:text-slate-900"
      >
          <Menu className="h-4 w-4" />
      </button>
      </div>

      <div className="hidden flex-grow space-y-1 px-4 py-5 md:block">
        {sidebarItems?.map((item: any, index: number) => {
          const Icon = item.icon;
          const isActive = item.href === pathName;

          return (
            <Link className="cursor-pointer" href={item.href} key={index}>
              <button
                className={`mb-1 flex min-h-9 w-full cursor-pointer items-center rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
                  isOpen ? "justify-start" : "justify-center"
                } ${
                  isActive
                    ? "bg-transparent text-[#2b9a3d]"
                    : "text-slate-500 hover:bg-[#f7faf8] hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 text-current ${isOpen ? "mr-2.5" : ""}`}
                />
                {isOpen && <span>{item.label}</span>}
              </button>
            </Link>
          );
        })}
      </div>
      {isMobile && (
        <Drawer
          backdrop={false}
          open={isOpen}
          onClose={toggleSidebar}
          position="left"
          className="mt-16 w-72 bg-white"
        >
          <div className="h-full w-64 bg-white p-4">
            {sidebarItems?.map((item: any, index: number) => {
              const Icon = item.icon;
              const isActive = item.href === pathName;

              return (
                <Link className="cursor-pointer" href={item.href} key={index}>
                  <button
                    className={`mb-1 flex min-h-9 w-full items-center rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
                      isActive
                        ? "bg-transparent text-[#2b9a3d]"
                        : "text-slate-500 hover:bg-[#f7faf8] hover:text-slate-900"
                    }`}
                    onClick={toggleSidebar}
                  >
                    <Icon className="mr-3" />
                    <span>{item.label}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </Drawer>
      )}
    </div>
  );
};

export default Sidebar;
