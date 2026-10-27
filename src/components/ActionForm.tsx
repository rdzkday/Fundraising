"use client";

import { Fragment, startTransition, useActionState, useEffect, useState } from "react";
import { PendingContext } from "./client";
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
  const [state, act, pending] = useActionState(action, null);
  // Setelah berhasil, isi form dipasang ulang supaya baris dinamis (mis. bukti) ikut kosong.
  const [round, setRound] = useState(0);
  useEffect(() => {
    if (state?.ok) setRound((n) => n + 1);
  }, [state]);
  return (
    // Dikirim lewat onSubmit, bukan prop `action`, supaya React tidak mengosongkan isian (termasuk file) saat ada error.
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => act(data));
      }}
    >
      <PendingContext value={pending}>
        <Fragment key={round}>{children}</Fragment>
      </PendingContext>
      {state?.error && <Notice kind="error">{state.error}</Notice>}
      {state?.ok && <Notice kind="ok">{state.ok}</Notice>}
    </form>
  );
}
