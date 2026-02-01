'use client';

import Link from "next/link";
import SignOutButton from "@/app/components/layouts/SignOutButton";
import { useSession } from "next-auth/react";
import { USER_ROLE } from "@/constants/role";

export default function Header() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === USER_ROLE.ADMIN;
  console.log("Header session:", session);

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center">
            <span className="sr-only">Blog App</span>
            <img
              alt="Blog Logo"
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=white&shade=600"
              className="h-8 w-auto"
            />
            <span className="ml-2 text-xl font-bold">My Blog</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          <Link href="/" className="text-sm font-semibold leading-6 hover:text-blue-200 transition-colors">
            Home
          </Link>
          <Link href="/blog" className="text-sm font-semibold leading-6 hover:text-blue-200 transition-colors">
            Blog
          </Link>
          <Link href="/about" className="text-sm font-semibold leading-6 hover:text-blue-200 transition-colors">
            About
          </Link>
          <Link href="/contacts" className="text-sm font-semibold leading-6 hover:text-blue-200 transition-colors">
            Contacts
          </Link>
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link href="/blogs/create" className="text-sm font-semibold leading-6 hover:text-blue-200 transition-colors">
                  Post
                </Link>
              )}
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold leading-6 hover:text-blue-200 transition-colors">
                Login
              </Link>
              <Link href="/signup" className="text-sm font-semibold leading-6 hover:text-blue-200 transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white hover:bg-blue-700 transition-colors"
            // TODO: Implement mobile menu toggle
          >
            <span className="sr-only">Open main menu</span>
            <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation - TODO: Implement collapsible menu */}
      <div className="lg:hidden">
        {/* Mobile menu items would go here */}
      </div>
    </header>
  );
}