import type { Metadata } from "next";
import { Baloo_2, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-baloo",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "AKSARA - Akses Belajar yang Ramah",
  description: "Platform belajar ramah untuk siswa, guru, dan admin SMKN 1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${baloo.variable} ${jakarta.variable}`}>
      <body className="font-body bg-paper text-ink min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
