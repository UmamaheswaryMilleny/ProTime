import {  ChevronLast, ChevronFirst } from "lucide-react";
import {
  useContext,
  createContext,
  useState,
} from "react";

import logo from '../../../public/logo-light.svg'
import type { ReactNode } from "react";
/* -------------------- Context Types -------------------- */
interface SidebarContextType {
  expanded: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(
  undefined
);

/* -------------------- Sidebar Props -------------------- */
interface SidebarProps {
  children: ReactNode;
}

/* -------------------- Sidebar Component -------------------- */
export default function Sidebar({ children }: SidebarProps) {
  const [expanded, setExpanded] = useState<boolean>(true);

  return (
<aside className={`h-screen transition-all ${expanded ? "w-64" : "w-16"}`}>


      <nav className="h-full flex flex-col bg-[#1C1C21]  shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <img
            src={logo}
            className={`overflow-hidden transition-all ${
              expanded ? "w-32" : "w-0"
            }`}
            alt="Logo"
          />
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>

      </nav>
    </aside>
  );
}

/* -------------------- SidebarItem Props -------------------- */
interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  alert?: boolean;
  onClick?: () => void
}

/* -------------------- SidebarItem Component -------------------- */
export function SidebarItem({
  icon,
  text,
  active = false,
  alert = false,
  onClick,
}: SidebarItemProps) {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("SidebarItem must be used within a Sidebar");
  }

  const { expanded } = context;

  return (
    <li
      className={`
        relative flex items-center py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group 
        ${
          active
            ? "bg-linear-to-tr from-indigo-700 to-indigo-300 text-white"
            : "hover:bg-linear-to-tr from-indigo-700 to-indigo-300 text-white"
        }
      `}  onClick={onClick} 
    >
      {icon}

      <span
        className={`overflow-hidden transition-all ${
          expanded ? "w-52 ml-3" : "w-0"
        }`}
      >
        {text}
      </span>

      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
            expanded ? "" : "top-2"
          }`}
        />
      )}

      {!expanded && (
        <div
          className={`
            absolute left-full rounded-md px-2 py-1 ml-6
            bg-indigo-100 text-indigo-800 text-sm
            invisible opacity-20 -translate-x-3 transition-all
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
          `}
        >
          {text}
        </div>
      )}
    </li>
  );
}
