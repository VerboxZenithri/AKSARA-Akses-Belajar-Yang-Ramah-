"""
AKSARA (Akses Belajar yang Ramah) - Backend
FastAPI + SQLite + WebSocket real-time sync.

Jalankan:
    uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine, SessionLocal
import models
from auth import hash_password
from routers import auth_router, admin_router, guru_router, siswa_router, ws_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AKSARA API", description="Akses Belajar yang Ramah")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # sesuaikan dengan domain frontend saat produksi
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def seed_admin():
    """Buat akun admin default agar sistem langsung bisa dipakai."""
    db = SessionLocal()
    try:
        if not db.query(models.User).filter(models.User.username == "admin").first():
            admin = models.User(
                username="admin",
                password_hash=hash_password("admin123"),
                nama_lengkap="Administrator SMKN 1",
                role=models.RoleEnum.admin,
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()


app.include_router(auth_router.router)
app.include_router(admin_router.router)
app.include_router(guru_router.router)
app.include_router(siswa_router.router)
app.include_router(ws_router.router)


@app.get("/")
def root():
    return {"status": "ok", "app": "AKSARA API"}
