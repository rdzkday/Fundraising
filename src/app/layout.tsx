import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { isDemo } from "@/lib/db";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "dibersamai.id: donasi yang bisa dilacak",
  description: "Crowdfunding pemulihan fisik dan mental korban bencana, dengan tiket untuk melacak setiap rupiah donasi.",
};

export const dynamic = "force-dynamic";

const NAV = [
  ["/dashboard", "Dashboard"],
  ["/project", "Project"],
  ["/pendanaan", "Pendanaan"],
  ["/tiket", "Cek Tiket"],
  ["/tentang", "Tentang Kami"],
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-brand">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <circle cx="16" cy="16" r="16" className="fill-lime" />
        <path d="M9 19c3-1 5-3 7-7 2 4 4 6 7 7M16 12v11" className="stroke-brand" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </svg>
      <span>dibersamai<span className="text-brand-2">.id</span></span>
    </Link>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${jakarta.variable} font-sans antialiased`}>
        {isDemo && (
          <div className="bg-ink px-4 py-1.5 text-center text-xs text-white/80">
            Mode demo: data contoh, belum terhubung ke Supabase. Rekening dan QRIS di halaman ini bukan rekening asli.
          </div>
        )}
        <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Logo />
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV.map(([href, label]) => (
                <Link key={href} href={href} className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-mist">
                  {label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/donasi" className="btn px-5 py-2.5 text-sm">
                Donate
              </Link>
              <details className="relative lg:hidden">
                <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-line" aria-label="Menu">
                  <svg viewBox="0 0 20 20" className="h-5 w-5"><path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                </summary>
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-line bg-white p-2 shadow-lg">
                  {NAV.map(([href, label]) => (
                    <Link key={href} href={href} className="block rounded-xl px-3 py-2 font-semibold hover:bg-mist">
                      {label}
                    </Link>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-24 border-t border-line bg-mist">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
            <div>
              <Logo />
              <p className="mt-3 text-sm text-muted">Gerakan transparansi donasi: pulihkan fisik dan mental, lacak setiap rupiahnya.</p>
            </div>
            <div className="text-sm">
              <p className="font-bold">Jelajahi</p>
              <ul className="mt-2 space-y-1 text-muted">
                {NAV.map(([href, label]) => (
                  <li key={href}><Link href={href} className="hover:text-ink">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="text-sm text-muted">
              <p className="font-bold text-ink">Untuk lembaga</p>
              <ul className="mt-2 space-y-1">
                <li><Link href="/pendanaan#galang" className="hover:text-ink">Ajukan campaign</Link></li>
                <li><Link href="/tentang#audit" className="hover:text-ink">Kolaborasi audit eksternal</Link></li>
              </ul>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
