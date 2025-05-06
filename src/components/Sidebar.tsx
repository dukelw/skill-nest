/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
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
  return (
    <div
      className={`transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      } bg-dark-green text-white flex flex-col h-full pt-4`}
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
          return (
            <Link className="cursor-pointer" href={item.href} key={index}>
              <button
                className={`flex items-center w-full text-white hover:bg-white hover:text-green-600 p-2 rounded mb-2 cursor-pointer ${
                  isOpen ? "justify-start" : "justify-center"
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
