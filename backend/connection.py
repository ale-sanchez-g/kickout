
from fastapi import WebSocket
from rpds import List
from typing import List
import asyncio
from mcp_server import get_crowd_telemetry

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_telemetry(self):
        """
        Background task to push live crowd updates.
        """
        while True:
            if self.active_connections:
                # Fetch fresh data from MCP logic
                data = get_crowd_telemetry("metlife")
                message = {
                    "event": "telemetry_pulse",
                    "data": data
                }
                for connection in self.active_connections:
                    try:
                        await connection.send_json(message)
                    except Exception:
                        self.disconnect(connection)
            await asyncio.sleep(5) # 5-second sensor refresh rate