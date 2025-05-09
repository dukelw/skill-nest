"use client";

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
      } bg-dark-green text-white flex flex-col h-full pt-2.5 min-h-screen`}
    >
      <button
        onClick={toggleSidebar}
        className="rounded-full flex items-center justify-center w-10 h-10 text-white bg-transparent hover:bg-white/10 transition-colors duration-200 ml-4"
      >
        <FaBars />
      </button>

      <div className="space-y-4 p-4 flex-grow">
        {sidebarItems.map((item: any, index: number) => {
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
                    ? "bg-white text-green-600"
                    : "text-white hover:bg-white hover:text-green-600"
                }`}
              >
                <Icon className={`mr-3 ${!isOpen && "mr-0"}`} />
                {isOpen && <span>{item.label}</span>}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
