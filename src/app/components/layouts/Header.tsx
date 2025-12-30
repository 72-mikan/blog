'use client";'

import Link from "next/link";
import SignOutButton from "@/app/components/layouts/SignOutButton"

export default function Header() {
  return (
    <div>
      <header className="bg-blue-200 p-4">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                alt=""
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto"
              />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              // onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              {/* <Bars3Icon aria-hidden="true" className="size-6" /> */}
              {/* ここにハンバーガーメニュー */}
            </button>
          </div>
        </nav>
        <h1>logo</h1>
        <ul>
          <li>Home</li>
          <li>Blog</li>
          <li>About</li>
          <li><SignOutButton /></li>
        </ul>
      </header>
    </div>
  );
}