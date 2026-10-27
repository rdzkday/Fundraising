import Link from "next/link";
import { adminLogout } from "@/app/actions";
import { requireAdmin } from "@/lib/auth";

export const metadata = { robots: { index: false } };

const MENU = [
  ["/admin", "Ringkasan"],
  ["/admin/donasi", "Donasi & verifikasi"],
  ["/admin/mutasi", "Unggah mutasi"],
  ["/admin/penyaluran", "Penyaluran"],
  ["/admin/operasional", "Operasional"],
  ["/admin/campaign", "Campaign"],
  ["/admin/pengaturan", "Pengaturan"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[200px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">Admin</p>
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {MENU.map(([href, label]) => (
            <Link key={href} href={href} className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold hover:bg-mist">
              {label}
            </Link>
          ))}
          <form action={adminLogout}>
            <button className="whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm font-semibold text-muted hover:bg-mist">Keluar</button>
          </form>
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
