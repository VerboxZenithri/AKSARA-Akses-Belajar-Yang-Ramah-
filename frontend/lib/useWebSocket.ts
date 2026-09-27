"use client";

import { useEffect, useRef, useState } from "react";
import { wsUrl } from "./api";

export interface WsMessage {
  type: string;
  [key: string]: unknown;
}

/**
 * Menghubungkan ke WebSocket Server backend untuk sinkronisasi real-time
 * (materi baru dari guru -> siswa, update progres siswa -> guru).
 */
export function useWebSocket(token: string | null) {
  const [lastMessage, setLastMessage] = useState<WsMessage | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout>;

    function connect() {
      const ws = new WebSocket(wsUrl(token as string));
      wsRef.current = ws;

      ws.onopen = () => !cancelled && setConnected(true);
      ws.onclose = () => {
        if (cancelled) return;
        setConnected(false);
        retryTimer = setTimeout(connect, 3000); // coba sambung ulang
      };
      ws.onerror = () => ws.close();
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WsMessage;
          if (!cancelled) setLastMessage(data);
        } catch {
          // abaikan pesan yang tidak valid
        }
      };
    }

    connect();
    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      wsRef.current?.close();
    };
  }, [token]);

  return { lastMessage, connected };
}
