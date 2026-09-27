import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-[440px_1fr]">
      {/* Kotak antarmuka login -- sisi kiri */}
      <section className="flex items-center justify-center px-8 py-16 bg-paper">
        <LoginForm />
      </section>

      {/* Panel ilustrasi -- sisi kanan */}
      <section className="hidden lg:flex relative items-center justify-center bg-primary overflow-hidden">
        <svg
          viewBox="0 0 600 600"
          className="absolute inset-0 w-full h-full opacity-90"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#2F6F6B" />
              <stop offset="1" stopColor="#204F4C" />
            </linearGradient>
          </defs>
          <rect width="600" height="600" fill="url(#g1)" />
          <circle cx="120" cy="120" r="90" fill="#EDA85A" opacity="0.18" />
          <circle cx="500" cy="470" r="130" fill="#FBE3C0" opacity="0.12" />
          <rect x="360" y="90" width="150" height="110" rx="20" fill="#FBF8F3" opacity="0.14" />
          <circle cx="470" cy="150" r="26" fill="#FBF8F3" opacity="0.9" />
          <polygon points="462,138 462,162 484,150" fill="#2F6F6B" />
        </svg>

        <div className="relative z-10 max-w-md px-10 text-center text-paper">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium mb-6">
            SMKN 1
          </div>
          <h2 className="font-display text-3xl font-bold leading-snug">
            Belajar step by step, video, audio &amp; teks — disesuaikan untuk
            setiap siswa.
          </h2>
          <p className="mt-4 text-paper/70 text-sm leading-relaxed">
            Guru memantau progres setiap siswa secara langsung. Siswa belajar
            dengan cara yang paling nyaman untuk mereka.
          </p>
        </div>
      </section>
    </main>
  );
}
