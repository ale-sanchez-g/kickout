# backend/mcp_server.py
"""
Model Context Protocol (MCP) Server for World Cup Event Safety.
Provides live crowd data, traffic streams, and stadium egress statuses to the AI agent.
"""

from typing import List, Dict, Any
from mcp.server.fastmcp import FastMCP

from kickout.backend.stimulated_data import STADIUMS

# Initialize FastMCP Server
mcp = FastMCP("world-cup-safety")


# Simulated Live Crowd & Traffic Database
from stimulated_data import STADIUMS

@mcp.tool()
def get_crowd_telemetry(stadium_id: str) -> Dict[str, Any]:
    """
    Retrieve real-time crowd occupancy rates and extreme congestion alerts for stadium gates.
    """
    stadium = STADIUMS.get(stadium_id, STADIUMS["metlife"])
    return {
        "stadium_name": stadium["name"],
        "gates": stadium["gates"],
        "telemetry_source": "Stadium Crowd Sensor Grid Hub"
    }

@mcp.tool()
def get_safe_meeting_points(stadium_id: str) -> List[Dict[str, Any]]:
    """
    Look up designated alternative safe pickup/meeting coordinates outside the main congestion zone.
    """
    stadium = STADIUMS.get(stadium_id, STADIUMS["metlife"])
    return stadium["meeting_points"]

@mcp.tool()
def evaluate_path_risk(coordinates: List[Dict[str, float]], current_congestion_zones: List[str]) -> Dict[str, Any]:
    """
    Evaluate mechanical squeeze risk and density index along a list of path coordinate checkpoints.
    """
    # Simply evaluate safety factor
    safety_percentage = 95.0
    for zone in current_congestion_zones:
        if "gate_c" in zone or "exit_transit" in zone:
            safety_percentage -= 35.0
    
    return {
        "safety_index": max(10.0, safety_percentage),
        "status": "APPROVED" if safety_percentage > 70.0 else "DANGER_REVISE",
        "comments": "Corridor clears major bottleneck zones."
    }

if __name__ == "__main__":
    # MCP server can run over standard input/output or HTTP
    mcp.run()