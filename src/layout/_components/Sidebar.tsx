"use client";

import { Drawer, DrawerItems } from "flowbite-react";
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  return (
    <div
      className={`transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      } bg-[#052f28] text-white flex flex-col h-[60px] md:h-full pt-2.5 md:min-h-screen shadow-[18px_0_45px_rgba(6,63,51,0.18)]`}
    >
      <button
        onClick={toggleSidebar}
        className="rounded-full flex items-center justify-center w-10 h-10 text-white bg-white/8 hover:bg-white/16 transition-colors duration-200 ml-4 z-100"
      >
        <FaBars />
      </button>

      <div className="space-y-2 p-4 flex-grow hidden md:block">
        {sidebarItems?.map((item: any, index: number) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathName === item.href
              : pathName.startsWith(item.href);
          return (
            <Link className="cursor-pointer" href={item.href} key={index}>
              <button
                className={`flex items-center w-full p-2 rounded mb-2 cursor-pointer transition-colors duration-200 ${
                  isOpen ? "justify-start" : "justify-center"
                } ${
                  isActive
                    ? "bg-white text-emerald-700 shadow-lg shadow-emerald-950/10"
                    : "text-emerald-50 hover:bg-white/12 hover:text-white"
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
          className="w-72 z-40 mt-[60px] bg-[#052f28]"
        >
          <div className="w-64 h-full bg-[#052f28] p-4 pt-0">
            {sidebarItems?.map((item: any, index: number) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathName === item.href
                  : pathName.startsWith(item.href);
              return (
                <Link className="cursor-pointer" href={item.href} key={index}>
                  <button
                    className={`flex items-center w-full p-2 rounded mb-2 transition-colors duration-200 ${
                      isActive
                        ? "bg-white text-emerald-700 shadow-lg shadow-emerald-950/10"
                        : "text-emerald-50 hover:bg-white/12 hover:text-white"
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
