"""
Dashboard Guru:
 - tombol pojok kanan bawah: nambah murid
 - tombol pojok kiri bawah: menambah materi
 - memantau progres tiap siswa (list materi berwarna: merah/kuning/hijau)
"""
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from auth import require_role, hash_password
from websocket_manager import manager

router = APIRouter(prefix="/api/guru", tags=["guru"])
guru_only = require_role("guru", "admin")


@router.post("/siswa", response_model=schemas.UserOut)
def tambah_siswa(payload: schemas.SiswaCreate, db: Session = Depends(get_db), _=Depends(guru_only)):
    if db.query(models.User).filter(models.User.username == payload.username).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Username sudah dipakai")
    siswa = models.User(
        username=payload.username,
        password_hash=hash_password(payload.password),
        nama_lengkap=payload.nama_lengkap,
        role=models.RoleEnum.siswa,
        kelas=payload.kelas,
        angkatan=payload.angkatan,
        is_abk=payload.is_abk,
    )
    db.add(siswa)
    db.commit()
    db.refresh(siswa)
    return siswa


@router.get("/siswa", response_model=list[schemas.UserOut])
def list_siswa(db: Session = Depends(get_db), _=Depends(guru_only)):
    return db.query(models.User).filter(models.User.role == models.RoleEnum.siswa).all()


@router.post("/materi", response_model=schemas.MateriOut)
async def tambah_materi(payload: schemas.MateriCreate, db: Session = Depends(get_db), guru=Depends(guru_only)):
    materi = models.Materi(
        judul=payload.judul,
        pengertian=payload.pengertian,
        step_by_step=json.dumps(payload.step_by_step),
        video_url=payload.video_url,
        audio_url=payload.audio_url,
        tugas_deskripsi=payload.tugas_deskripsi,
        untuk_angkatan=payload.untuk_angkatan,
        dibuat_oleh=guru.id,
    )
    db.add(materi)
    db.commit()
    db.refresh(materi)

    # Sinkronisasi real-time: siswa angkatan terkait langsung melihat materi baru
    materi_out = schemas.MateriOut.model_validate(materi)
    await manager.broadcast_ke_angkatan(
        payload.untuk_angkatan,
        {"type": "materi_baru", "materi": json.loads(materi_out.model_dump_json())},
    )
    return materi


@router.get("/materi", response_model=list[schemas.MateriOut])
def list_materi(db: Session = Depends(get_db), _=Depends(guru_only)):
    return db.query(models.Materi).order_by(models.Materi.created_at.desc()).all()


@router.get("/progres", response_model=list[schemas.ProgressBaris])
def monitor_progres(db: Session = Depends(get_db), _=Depends(guru_only)):
    """
    [DASHBOARD] guru: 'Nama murid di pencet: bisa melihat biodata, lalu di
    bawahnya progress pematerinya' -- list materi berwarna per siswa.
    """
    siswa_list = db.query(models.User).filter(models.User.role == models.RoleEnum.siswa).all()
    materi_list = db.query(models.Materi).all()
    progres_map = {(p.siswa_id, p.materi_id): p.status for p in db.query(models.Progress).all()}

    hasil = []
    for siswa in siswa_list:
        for materi in materi_list:
            if materi.untuk_angkatan != siswa.angkatan:
                continue
            status_ = progres_map.get((siswa.id, materi.id), models.StatusEnum.belum)
            hasil.append(
                schemas.ProgressBaris(
                    siswa=siswa, materi_id=materi.id, materi_judul=materi.judul, status=status_
                )
            )
    return hasil
