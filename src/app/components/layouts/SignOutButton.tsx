"use client";

import { useTransition } from "react";
import { customSignOut } from "@/lib/actions/signOut";
import { UpdateSession } from "next-auth/react";

export default function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  const signOut = () => {
    startTransition(async () => {
      await customSignOut();
    });
  };

  return (
    <button onClick={signOut}>
      {isPending ? "Signing out..." : "Sign Out"}
    </button>
  );
}
