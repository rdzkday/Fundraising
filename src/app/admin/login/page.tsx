import { adminLogin } from "@/app/actions";
import { ActionForm } from "@/components/ActionForm";
import { Submit } from "@/components/client";
import { isDemo } from "@/lib/db";

export const metadata = { title: "Masuk admin | dibersamai.id", robots: { index: false } };

export default function Login() {
  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <h1 className="text-3xl font-extrabold">Masuk admin</h1>
      <ActionForm action={adminLogin} className="mt-6 space-y-3">
        <input type="password" name="password" className="input" placeholder="Kata sandi admin" required autoFocus aria-label="Kata sandi admin" />
        <Submit className="btn w-full">Masuk</Submit>
      </ActionForm>
      {isDemo && <p className="mt-4 text-sm text-muted">Mode demo: kata sandi bawaan <code>admin</code>, kecuali ADMIN_PASSWORD diisi.</p>}
    </div>
  );
}
