"use client";

import { useTransition } from "react";
import { customSignOut } from "@/lib/actions/signOut";

export default function Header() {
  const [isPending, startTransition] = useTransition();

  const signOut = () => {
    startTransition(() => {
      customSignOut();
    });
  };

  return (
    <button onClick={signOut}>
      {isPending ? "Signing out..." : "Sign Out"}
    </button>
  );
}
