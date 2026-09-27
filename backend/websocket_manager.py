"""
Manajer koneksi WebSocket untuk sinkronisasi real-time antara
Dashboard Siswa <-> Dashboard Guru (mis. materi baru, update progres).
"""
import json
from typing import Dict, List
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # user_id -> info koneksi
        self.active: Dict[int, dict] = {}

    async def connect(self, websocket: WebSocket, user_id: int, role: str, angkatan: int | None):
        await websocket.accept()
        self.active[user_id] = {"ws": websocket, "role": role, "angkatan": angkatan}

    def disconnect(self, user_id: int):
        self.active.pop(user_id, None)

    async def _send(self, websocket: WebSocket, message: dict):
        try:
            await websocket.send_text(json.dumps(message))
        except Exception:
            pass

    async def send_personal(self, user_id: int, message: dict):
        conn = self.active.get(user_id)
        if conn:
            await self._send(conn["ws"], message)

    async def broadcast_ke_angkatan(self, angkatan: int, message: dict):
        """Kirim ke semua siswa dari angkatan tertentu (mis. materi baru)."""
        for info in self.active.values():
            if info["role"] == "siswa" and info["angkatan"] == angkatan:
                await self._send(info["ws"], message)

    async def broadcast_ke_guru_admin(self, message: dict):
        """Kirim ke semua guru & admin yang sedang online (mis. progres siswa berubah)."""
        for info in self.active.values():
            if info["role"] in ("guru", "admin"):
                await self._send(info["ws"], message)


manager = ConnectionManager()
