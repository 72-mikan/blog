"use client";

import { useTransition } from "react";
import { customSignOut } from "@/lib/actions/signOut";

export default function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  const signOut = () => {
    startTransition(async () => {
      await customSignOut();
    });
  };

  return (
    <button
      onClick={signOut}
      className="text-left text-sm font-semibold leading-6 hover:text-blue-200 transition-colors disabled:opacity-70"
      disabled={isPending}
    >
      {isPending ? "Signing out..." : "Sign Out"}
    </button>
  );
}
