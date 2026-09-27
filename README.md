# AKSARA — Akses Belajar yang Ramah

Implementasi kode dari flowchart AKSARA, menggunakan:

- **Frontend**: Next.js (App Router) + Tailwind CSS
- **Backend**: Python + FastAPI
- **Database**: SQLite (via SQLAlchemy)
- **Real-time**: WebSocket Server bawaan FastAPI, mensinkronkan
  Dashboard Siswa ⇄ Dashboard Guru (materi baru & update progres
  langsung tanpa reload)

## Struktur proyek

```
aksara-app/
├── backend/            FastAPI + SQLite + WebSocket
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── websocket_manager.py
│   ├── requirements.txt
│   └── routers/
│       ├── auth_router.py
│       ├── admin_router.py
│       ├── guru_router.py
│       ├── siswa_router.py
│       └── ws_router.py
└── frontend/           Next.js + Tailwind CSS
    ├── app/
    │   ├── page.tsx                       Halaman Login AKSARA
    │   └── dashboard/
    │       ├── siswa/page.tsx             Dashboard Siswa (list materi)
    │       ├── siswa/materi/[id]/page.tsx Video, Teks, Step-by-Step, Tugas
    │       ├── guru/page.tsx              Dashboard Guru (+ tambah materi/murid)
    │       └── admin/page.tsx             Dashboard Admin ([CRUD])
    ├── components/
    └── lib/                               api client, auth context, WebSocket hook
```

## Menjalankan Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate   # opsional tapi disarankan
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend otomatis membuat `aksara.db` (SQLite) dan akun admin default saat pertama kali
dijalankan:

- **username**: `admin`
- **password**: `admin123`

Gunakan akun admin ini untuk masuk lalu buat akun **guru** dari Dashboard Admin.
Guru yang sudah login dapat menambah akun **siswa** dan **materi** dari Dashboard Guru.

## Menjalankan Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # sesuaikan jika backend tidak di localhost:8000
npm run dev
```

Buka http://localhost:3000 — halaman Login AKSARA akan tampil.

## Alur sesuai flowchart

1. **Login** → server mengembalikan JWT + role (`admin` / `guru` / `siswa`), frontend
   mengarahkan ke dashboard yang sesuai.
2. **Admin** ([CRUD]) → membuat akun guru, melihat & mengubah/menghapus akun guru/siswa
   (termasuk siswa ABK).
3. **Guru** → tombol pojok kiri bawah "+ Materi" (judul, pengertian, step by step,
   video+audio, untuk angkatan berapa) dan tombol pojok kanan bawah "+ Murid".
   Guru juga memantau progres tiap siswa (klik nama → biodata + daftar materi
   berwarna merah/kuning/hijau).
4. **Siswa** → Dashboard menampilkan seluruh mata pelajaran sesuai angkatannya,
   diwarnai sesuai status. Membuka materi menampilkan Video+Audio, Teks Materi,
   Step-by-Step, dan Tugas di akhir.
5. **WebSocket Sync** → saat guru submit materi baru, semua siswa di angkatan
   tersebut langsung melihatnya tanpa refresh. Saat siswa menyelesaikan tugas,
   dashboard guru langsung memperbarui warna progres siswa tersebut.

## Catatan

- Ini adalah implementasi referensi yang bisa dikembangkan lebih lanjut (mis.
  upload file video/audio langsung alih-alih URL, halaman lupa password, dsb).
- Untuk produksi, ganti `SECRET_KEY` di `backend/auth.py` dan batasi `allow_origins`
  di `backend/main.py` sesuai domain frontend.
