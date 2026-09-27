"""
Model tabel SQLite: User (admin/guru/siswa), Materi, Progress.
"""
import enum
import datetime

from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey,
    Enum as SAEnum, UniqueConstraint,
)
from sqlalchemy.orm import relationship

from database import Base


class RoleEnum(str, enum.Enum):
    admin = "admin"
    guru = "guru"
    siswa = "siswa"


class StatusEnum(str, enum.Enum):
    """Status progres materi, dipetakan ke warna di dashboard guru."""
    belum = "belum"      # merah
    proses = "proses"    # kuning
    selesai = "selesai"  # hijau


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    nama_lengkap = Column(String, nullable=False)
    role = Column(SAEnum(RoleEnum), nullable=False)

    # Khusus siswa
    kelas = Column(String, nullable=True)
    angkatan = Column(Integer, nullable=True)
    is_abk = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    materi_dibuat = relationship(
        "Materi", back_populates="pembuat", foreign_keys="Materi.dibuat_oleh"
    )
    progres = relationship(
        "Progress", back_populates="siswa", foreign_keys="Progress.siswa_id"
    )


class Materi(Base):
    __tablename__ = "materi"

    id = Column(Integer, primary_key=True, index=True)
    judul = Column(String, nullable=False)
    pengertian = Column(Text, nullable=False, default="")
    step_by_step = Column(Text, nullable=False, default="[]")  # JSON list[str]
    video_url = Column(String, nullable=True)
    audio_url = Column(String, nullable=True)
    tugas_deskripsi = Column(Text, nullable=True)
    untuk_angkatan = Column(Integer, nullable=False)

    dibuat_oleh = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    pembuat = relationship(
        "User", back_populates="materi_dibuat", foreign_keys=[dibuat_oleh]
    )
    progres = relationship("Progress", back_populates="materi")


class Progress(Base):
    __tablename__ = "progress"
    __table_args__ = (UniqueConstraint("siswa_id", "materi_id", name="uq_siswa_materi"),)

    id = Column(Integer, primary_key=True, index=True)
    siswa_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    materi_id = Column(Integer, ForeignKey("materi.id"), nullable=False)
    status = Column(SAEnum(StatusEnum), default=StatusEnum.belum, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    siswa = relationship("User", back_populates="progres", foreign_keys=[siswa_id])
    materi = relationship("Materi", back_populates="progres")
