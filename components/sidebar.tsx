import { classNames } from "./layout";
import { PlayCircleIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

const navigation = [
  { name: "Create", href: "/create", icon: PlusIcon },
  { name: "Videos", href: "/", icon: PlayCircleIcon },
];

export default function Sidebar() {
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r border-gray-200">
      <div className="flex h-16 shrink-0 items-center">
        <img
          className="h-8 w-auto mr-2"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
        Pranoto.ai
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item: any) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={classNames(
                      item.current
                        ? "bg-gray-50 text-indigo-600"
                        : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                    )}
                  >
                    <item.icon
                      className={classNames(
                        item.current
                          ? "text-indigo-600"
                          : "text-gray-400 group-hover:text-indigo-600",
                        "h-6 w-6 shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}
