"use client";

import { Drawer } from "~/components/ui/primitives";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars } from "react-icons/fa";
import dashboardSidebarItems from "~/static/DashboardSideBarItem";
import adminSidebarItems from "~/static/AdminSideBarItem";
import { useAuthStore } from "~/store/authStore";
import { UserRole } from "~/models/UserRole";

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
  return (
    <div
      className={`transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      } flex h-[60px] flex-col border-r border-slate-200 bg-white text-slate-800 shadow-sm md:h-full md:min-h-screen md:pt-2.5`}
    >
      <button
        onClick={toggleSidebar}
        className="z-100 ml-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 transition-colors duration-200 hover:bg-emerald-100"
      >
        <FaBars />
      </button>

      <div className="hidden flex-grow space-y-1 p-3 md:block">
        {sidebarItems?.map((item: any, index: number) => {
          const Icon = item.icon;
          const isActive = item.href === pathName;

          return (
            <Link className="cursor-pointer" href={item.href} key={index}>
              <button
                className={`mb-1 flex min-h-10 w-full cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-150 ${
                  isOpen ? "justify-start" : "justify-center"
                } ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon className={`mr-3 ${!isOpen && "mr-0"}`} />
                {isOpen && <span>{item.label}</span>}
              </button>
            </Link>
          );
        })}
      </div>
      {/* Overlay + drawer */}
      <div className="md:hidden">
        <Drawer
          backdrop={false}
          open={isOpen}
          onClose={toggleSidebar}
          position="left"
          className="w-72 z-40 mt-[60px] bg-dark-green"
        >
          <div className="h-full w-64 bg-white p-4 pt-0">
            {sidebarItems?.map((item: any, index: number) => {
              const Icon = item.icon;
              const isActive = item.href === pathName;

              return (
                <Link className="cursor-pointer" href={item.href} key={index}>
                  <button
                    className={`mb-1 flex min-h-10 w-full items-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-150 ${
                      isActive
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
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
      </div>
    </div>
  );
};

export default Sidebar;
