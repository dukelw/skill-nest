import {
  FaHome,
  FaInfoCircle,
  FaServicestack,
  FaPhoneAlt,
} from "react-icons/fa";
import { FaBars } from "react-icons/fa";

const Sidebar = ({
  isOpen,
  toggleSidebar,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
}) => {
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
        <button
          className={`flex items-center w-full text-white hover:bg-white hover:text-green-600 p-2 rounded ${
            isOpen ? "justify-start" : "justify-center"
          }`}
        >
          <FaHome className={`mr-3 ${!isOpen && "mr-0"}`} />
          {isOpen && <span>Home</span>}
        </button>

        <button
          className={`flex items-center w-full text-white hover:bg-white hover:text-green-600 p-2 rounded ${
            isOpen ? "justify-start" : "justify-center"
          }`}
        >
          <FaInfoCircle className={`mr-3 ${!isOpen && "mr-0"}`} />
          {isOpen && <span>About</span>}
        </button>

        <button
          className={`flex items-center w-full text-white hover:bg-white hover:text-green-600 p-2 rounded ${
            isOpen ? "justify-start" : "justify-center"
          }`}
        >
          <FaServicestack className={`mr-3 ${!isOpen && "mr-0"}`} />
          {isOpen && <span>Services</span>}
        </button>

        <button
          className={`flex items-center w-full text-white hover:bg-white hover:text-green-600 p-2 rounded ${
            isOpen ? "justify-start" : "justify-center"
          }`}
        >
          <FaPhoneAlt className={`mr-3 ${!isOpen && "mr-0"}`} />
          {isOpen && <span>Contact</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
