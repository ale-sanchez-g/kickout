import os
import json
from typing import Dict, Any
import openai


class WorldCupSafetyAgent:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            openai.api_key = api_key
        self.model_id = os.getenv("OPENAI_MODEL", "gpt-4")

    def generate_tactical_plan(self, stadium_id: str, user_location: str):
        """
        The orchestrator: It uses tools to gather data before providing the final JSON plan.
        """
        instruction = (
            "You are a Tactical Safety AI. Use the provided context to check crowd levels "
            "and safe zones before recommending an egress path. If a gate is 'Extreme Bottleneck', "
            "do NOT route users through it. Respond with a JSON object describing the plan."
        )

        prompt = f"Provide a safety evacuation plan for a user at {user_location} in {stadium_id}. Return JSON."

        messages = [
            {"role": "system", "content": instruction},
            {"role": "user", "content": prompt}
        ]

        try:
            response = openai.ChatCompletion.create(
                model=self.model_id,
                messages=messages,
                temperature=0.2,
                max_tokens=800
            )

            # Extract assistant content
            content = None
            try:
                content = response["choices"][0]["message"]["content"]
            except Exception:
                # older response shapes
                content = getattr(response, "choices", [])[0].message.content if getattr(response, "choices", None) else str(response)

            try:
                return json.loads(content)
            except Exception:
                return {"text": content, "raw_response": response}
        except Exception as e:
            return {"error": f"Tactical calculation failed: {str(e)}"}

    def analyze_escape_route(self, stadium_id: str, gate_id: str, destination: str, crowd_state: Dict[str, Any]):
        """
        Backwards-compatible entrypoint used by `main.py`.
        Accepts the additional parameters `gate_id` and `crowd_state` but
        delegates to `generate_tactical_plan`. Embeds the crowd state into
        the prompt so the model can use it when producing the plan.
        """
        # Build a richer user location/context string for the tactical planner
        user_location = f"near gate {gate_id} at {destination}. Crowd state: {json.dumps(crowd_state)}"
        try:
            return self.generate_tactical_plan(stadium_id, user_location)
        except Exception as e:
            return {"error": f"Analyze escape route failed: {str(e)}"}