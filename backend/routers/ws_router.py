"""
WebSocket Server: sinkronisasi real-time Dashboard Siswa <-> Dashboard Guru.
Koneksi: ws://<host>/ws?token=<JWT>
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session

from database import SessionLocal
import models
from auth import decode_token
from websocket_manager import manager

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    payload = decode_token(token)
    if payload is None:
        await websocket.close(code=4401)
        return

    db: Session = SessionLocal()
    user = db.query(models.User).filter(models.User.id == int(payload["sub"])).first()
    db.close()
    if user is None:
        await websocket.close(code=4401)
        return

    await manager.connect(websocket, user.id, user.role.value, user.angkatan)
    try:
        while True:
            # Klien tidak wajib mengirim apa pun; hanya menerima broadcast.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user.id)
