import { findTicket } from "@/app/actions";
import { Submit } from "@/components/client";

export const metadata = { title: "Cek Tiket | dibersamai.id" };

export default function TiketPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="chip">Lacak donasi</p>
      <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">Cek tiket donasimu</h1>
      <p className="mt-3 text-muted">Masukkan kode tiket yang kamu dapat setelah berdonasi, misalnya DB-DEMO01.</p>
      <form action={findTicket} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input name="ticket" className="input text-center font-mono text-lg uppercase sm:text-left" placeholder="DB-XXXXXX" required maxLength={20} aria-label="Kode tiket" />
        <Submit>Cek</Submit>
      </form>
    </div>
  );
}
