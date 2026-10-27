"use client";

import { useActionState } from "react";
import { uploadProof } from "@/app/actions";
import { Submit } from "@/components/client";
import { Notice } from "@/components/ui";

export function ProofForm({ ticket }: { ticket: string }) {
  const [state, action] = useActionState(uploadProof, null);
  if (state?.ok) return <Notice kind="ok">{state.ok}</Notice>;
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="ticket" value={ticket} />
      <input type="file" name="proof" accept="image/png,image/jpeg,image/webp,application/pdf" required className="input text-sm" aria-label="File bukti transfer" />
      <p className="text-xs text-muted">JPG, PNG, atau PDF, maksimal 5 MB. Bukti hanya bisa dilihat admin, tidak tampil ke publik.</p>
      {state?.error && <Notice kind="error">{state.error}</Notice>}
      <Submit className="btn-ghost">Kirim bukti transfer</Submit>
    </form>
  );
}
