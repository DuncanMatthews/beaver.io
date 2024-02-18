

import Link from "next/link"
import { Button } from "@/components/ui/button"
import AuthButton from "./AuthButton"

export default function Header() {
  return (
<header className="bg-white dark:bg-gray-800 shadow">
  <div className="container mx-auto flex items-center py-4 px-4 md:px-6 text-gray-900 dark:text-gray-50">
    <Link className="flex items-center gap-2 font-semibold text-lg hover:text-blue-500 dark:hover:text-blue-400" href="/">
      <HomeIcon className="w-6 h-6 text-current" />
      Home
    </Link>
    <div className="flex-1" />
    <AuthButton className="text-sm px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" />
  </div>
</header>

  )
}

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}
