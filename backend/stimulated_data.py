# Simulated Live Crowd & Traffic Database
STADIUMS = {
    "metlife": {
        "name": "MetLife Stadium (NY/NJ)",
        "coordinates": {"lat": 40.8135, "lng": -74.0744},
        "gates": [
            {"id": "gate_a", "name": "Verizon Gate A (North)", "crowd_level": 85, "status": "Congested"},
            {"id": "gate_b", "name": "HRE Gate B (East)", "crowd_level": 42, "status": "Moderate"},
            {"id": "gate_c", "name": "MetLife Gate C (Southwest)", "crowd_level": 92, "status": "Extreme Bottleneck"},
            {"id": "gate_d", "name": "Pepsi Gate D (West)", "crowd_level": 15, "status": "Quiet / Open"},
        ],
        "meeting_points": [
            {"id": "mp_redd", "name": "Redd's Park & Ride Safe Zone", "coordinates": {"lat": 40.8105, "lng": -74.0835}, "safety_score": 95},
            {"id": "mp_lot_g", "name": "Overflow Lot G", "coordinates": {"lat": 40.8080, "lng": -74.0790}, "safety_score": 88}
        ]
    }
}