"use client";

import { useActionState } from "react";
import { Notice } from "./ui";

type Result = { ok?: string; error?: string } | null | undefined;

export function ActionForm({
  action,
  children,
  className,
}: {
  action: (state: unknown, f: FormData) => Promise<Result>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, act] = useActionState(action, null);
  return (
    <form action={act} className={className}>
      {children}
      {state?.error && <Notice kind="error">{state.error}</Notice>}
      {state?.ok && <Notice kind="ok">{state.ok}</Notice>}
    </form>
  );
}
