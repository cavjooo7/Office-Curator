import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Practice OS Cloud",
  description: "Cloud office operating system for accounting, tax and compliance practice"
};

const nav = [
  ["/dashboard", "Dashboard"],
  ["/my-work", "My Work"],
  ["/tasks", "Tasks"],
  ["/clients", "Clients"],
  ["/staff", "Staff"],
  ["/owner-review", "Owner Review"]
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <Link className="brand" href="/dashboard">
              <span className="brand-mark">POS</span>
              <span>
                <strong>Practice OS</strong>
                <br />
                <small>Cloud office command centre</small>
              </span>
            </Link>
            <nav className="nav">
              {nav.map(([href, label]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
