"""
Dashboard Siswa:
 - [DASHBOARD] semua list mata pelajaran (menyesuaikan angkatan siswa)
 - materi diwarnai: merah (belum), kuning (proses), hijau (selesai)
 - halaman materi: Video+Audio, Teks Materi (Pengertian), Step by Step, Tugas
"""
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from auth import require_role
from websocket_manager import manager

router = APIRouter(prefix="/api/siswa", tags=["siswa"])
siswa_only = require_role("siswa")


def _status_siswa(db: Session, siswa_id: int, materi_id: int) -> models.StatusEnum:
    p = (
        db.query(models.Progress)
        .filter(models.Progress.siswa_id == siswa_id, models.Progress.materi_id == materi_id)
        .first()
    )
    return p.status if p else models.StatusEnum.belum


@router.get("/materi", response_model=list[schemas.MateriWithProgress])
def list_materi_saya(db: Session = Depends(get_db), siswa=Depends(siswa_only)):
    materi_list = (
        db.query(models.Materi)
        .filter(models.Materi.untuk_angkatan == siswa.angkatan)
        .order_by(models.Materi.created_at.desc())
        .all()
    )
    hasil = []
    for m in materi_list:
        out = schemas.MateriWithProgress.model_validate(m)
        out.status = _status_siswa(db, siswa.id, m.id)
        hasil.append(out)
    return hasil


@router.get("/materi/{materi_id}", response_model=schemas.MateriWithProgress)
def detail_materi(materi_id: int, db: Session = Depends(get_db), siswa=Depends(siswa_only)):
    m = db.query(models.Materi).filter(models.Materi.id == materi_id).first()
    if not m or m.untuk_angkatan != siswa.angkatan:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Materi tidak ditemukan")
    out = schemas.MateriWithProgress.model_validate(m)
    out.status = _status_siswa(db, siswa.id, m.id)
    return out


@router.post("/materi/{materi_id}/progress", response_model=schemas.ProgressOut)
async def update_progress(
    materi_id: int,
    payload: schemas.ProgressUpdate,
    db: Session = Depends(get_db),
    siswa=Depends(siswa_only),
):
    materi = db.query(models.Materi).filter(models.Materi.id == materi_id).first()
    if not materi:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Materi tidak ditemukan")

    progres = (
        db.query(models.Progress)
        .filter(models.Progress.siswa_id == siswa.id, models.Progress.materi_id == materi_id)
        .first()
    )
    if progres:
        progres.status = payload.status
    else:
        progres = models.Progress(siswa_id=siswa.id, materi_id=materi_id, status=payload.status)
        db.add(progres)
    db.commit()
    db.refresh(progres)

    # Sinkronisasi real-time ke dashboard guru: warna progres berubah langsung
    await manager.broadcast_ke_guru_admin(
        {
            "type": "progress_update",
            "siswa_id": siswa.id,
            "siswa_nama": siswa.nama_lengkap,
            "materi_id": materi_id,
            "materi_judul": materi.judul,
            "status": payload.status.value,
        }
    )
    return progres
