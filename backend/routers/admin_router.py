"""
[CRUD] Dashboard Admin: buat akun guru, lihat database siswa/guru,
update & delete akun/fitur.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from auth import require_role, hash_password

router = APIRouter(prefix="/api/admin", tags=["admin"])
admin_only = require_role("admin")


@router.get("/users", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db), _=Depends(admin_only)):
    return db.query(models.User).order_by(models.User.role, models.User.nama_lengkap).all()


@router.post("/guru", response_model=schemas.UserOut)
def buat_guru(payload: schemas.GuruCreate, db: Session = Depends(get_db), _=Depends(admin_only)):
    if db.query(models.User).filter(models.User.username == payload.username).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Username sudah dipakai")
    guru = models.User(
        username=payload.username,
        password_hash=hash_password(payload.password),
        nama_lengkap=payload.nama_lengkap,
        role=models.RoleEnum.guru,
    )
    db.add(guru)
    db.commit()
    db.refresh(guru)
    return guru


@router.put("/users/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, payload: schemas.UserUpdate, db: Session = Depends(get_db), _=Depends(admin_only)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pengguna tidak ditemukan")
    data = payload.model_dump(exclude_unset=True)
    if "password" in data and data["password"]:
        user.password_hash = hash_password(data.pop("password"))
    else:
        data.pop("password", None)
    for field, value in data.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), _=Depends(admin_only)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pengguna tidak ditemukan")
    if user.role == models.RoleEnum.admin:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Akun admin tidak bisa dihapus")
    db.delete(user)
    db.commit()
    return {"ok": True}
