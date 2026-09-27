"""
Skema Pydantic untuk request/response API.
"""
import json
import datetime
from typing import Optional, List

from pydantic import BaseModel, field_validator

from models import RoleEnum, StatusEnum


# ---------- Auth ----------
class LoginRequest(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    nama_lengkap: str
    role: RoleEnum
    kelas: Optional[str] = None
    angkatan: Optional[int] = None
    is_abk: bool = False

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Users (dipakai Admin & Guru) ----------
class SiswaCreate(BaseModel):
    username: str
    password: str
    nama_lengkap: str
    kelas: str
    angkatan: int
    is_abk: bool = False


class GuruCreate(BaseModel):
    username: str
    password: str
    nama_lengkap: str


class UserUpdate(BaseModel):
    nama_lengkap: Optional[str] = None
    kelas: Optional[str] = None
    angkatan: Optional[int] = None
    is_abk: Optional[bool] = None
    password: Optional[str] = None


# ---------- Materi ----------
class MateriCreate(BaseModel):
    judul: str
    pengertian: str
    step_by_step: List[str] = []
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    tugas_deskripsi: Optional[str] = None
    untuk_angkatan: int


class MateriOut(BaseModel):
    id: int
    judul: str
    pengertian: str
    step_by_step: List[str]
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    tugas_deskripsi: Optional[str] = None
    untuk_angkatan: int
    created_at: datetime.datetime

    @field_validator("step_by_step", mode="before")
    @classmethod
    def parse_steps(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return []
        return v

    class Config:
        from_attributes = True


class MateriWithProgress(MateriOut):
    status: StatusEnum = StatusEnum.belum


# ---------- Progress ----------
class ProgressUpdate(BaseModel):
    status: StatusEnum


class ProgressOut(BaseModel):
    id: int
    siswa_id: int
    materi_id: int
    status: StatusEnum
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


class ProgressBaris(BaseModel):
    """Satu baris di tabel monitor progres milik guru: siswa x materi."""
    siswa: UserOut
    materi_id: int
    materi_judul: str
    status: StatusEnum
