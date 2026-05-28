import os
import asyncio
import logging
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from agent import WorldCupSafetyAgent
from mcp_server import get_crowd_telemetry
from connection import ConnectionManager

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("CopaSafe")

app = FastAPI(title="Kickout: Live Escape intel")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Agent
agent = WorldCupSafetyAgent()

@app.get("/api/health")
def health_check():
    return {"status": "operational", "mcp_status": "synced", "region": "US-EAST-4"}

@app.post("/api/plan-escape")
async def plan_escape_route(stadium_id: str, gate_id: str, destination: str):
    """
    Orchestrates the safety logic: 
    1. Fetches data from MCP Tool
    2. Sends context to Gemini Agent
    3. Returns structured tactical plan
    """
    try:
        # 1. Get real-time telemetry from MCP logic
        crowd_state = get_crowd_telemetry(stadium_id)
        
        # 2. Run the AI Analysis (offload to thread if SDK is synchronous)
        # Note: In a production env, use the async version of the SDK if available
        loop = asyncio.get_event_loop()
        report = await loop.run_in_executor(
            None, agent.analyze_escape_route, stadium_id, gate_id, destination, crowd_state
        )
        
        return report
    except Exception as e:
        logger.error(f"Escape planning failed: {e}")
        raise HTTPException(status_code=500, detail="Tactical Coordinator is temporarily offline.")

manager = ConnectionManager()



@asynccontextmanager
async def lifespan(app: FastAPI):
    # [STARTUP] Start the background task
    # We store the task in a variable to keep a "strong reference" 
    # (prevents Python's garbage collector from killing it)
    telemetry_task = asyncio.create_task(manager.broadcast_telemetry())
    
    yield  # The app runs here
    
    # [SHUTDOWN] Clean up
    telemetry_task.cancel()
    await asyncio.gather(telemetry_task, return_exceptions=True)

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await websocket.send_json({"event": "sys_msg", "text": "Tactical Uplink Established"})
        while True:
            # Keep the connection open and listen for user pings
            await websocket.receive_text() 
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
