import os
import re
import json
from typing import Dict, List, Any
from google import genai

class GuidanceEngine:
    def __init__(self):
        # Using the user's Gemini API key
        self.api_key = "AIzaSyCSMxvCyT8maRizUik4Ia13hu9VFGEsDfs"
        
        try:
            self.client = genai.Client(
                api_key=self.api_key, 
                http_options={'api_version': 'v1beta'}
            )
            # Use 2.5 Flash for high intelligence reasoning
            self.model_name = "gemini-2.5-flash"
        except Exception as e:
            print(f"Guidance Engine Init Error: {e}")
            self.client = None

    def suggest_department(self, interests: List[str]) -> Dict[str, Any]:
        """
        Suggests the best academic department/stream (e.g., for 11th grade) based on learning history.
        """
        if not self.client:
            return {"error": "AI Offline"}

        interests_str = ", ".join(interests) if interests else "General Studies"
        
        prompt = f"""
        TASK: ACT AS A FUTURISTIC AI ORACLE (Year 2030).
        ANALYZE PROTOCOL: {interests_str}
        
        Using predictive algorithms, identify the optimal 'Academic Stream' for this user's neurological profile.
        Identify the pathway that maximizes their potential in the future economy.
        
        TONE: High-tech, visionary, precise, confident.
        
        OUTPUT FORMAT (STRICT JSON):
        {{
            "department": "Stream Name (e.g. Quantum Computing & Physics)",
            "confidence": "98%",
            "reasoning": "Futuristic explanation. Use terms like 'Cognitive Alignment', 'Neural Synergy', 'Future-Proofing'.",
            "electives": ["Module 1", "Module 2"]
        }}
        """

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return self._parse_json(response.text)
        except Exception as e:
            return {"error": str(e)}

    def suggest_role(self, interests: List[str]) -> Dict[str, Any]:
        """
        Suggests the best future career role based on learning history.
        """
        if not self.client:
            return {"error": "AI Offline"}

        interests_str = ", ".join(interests) if interests else "Technology"
        
        prompt = f"""
        TASK: ACT AS A CAREER ARCHITECT FROM 2030.
        DATA INGESTION: {interests_str}
        
        Extrapolate this data to predict the user's ideal 'High-Value Role' in the future economy.
        Think beyond today's titles. Invent or adapt roles for the Web3/AI era.
        
        TONE: Sci-Fi, Analytical, Executive, Inspiring.
        
        OUTPUT FORMAT (STRICT JSON):
        {{
            "role": "Futuristic Job Title (e.g. Neural Interface Architect)",
            "confidence": "94%",
            "reasoning": "Explain the fit using terms like 'Skill Velocity', 'Market Trajectory', 'Algorithmic Fit'.",
            "skills_gap": ["Critical Upgrade 1", "Critical Upgrade 2"]
        }}
        """

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return self._parse_json(response.text)
        except Exception as e:
            return {"error": str(e)}

    def _parse_json(self, text):
        try:
            clean = re.sub(r'```json', '', text)
            clean = re.sub(r'```', '', clean).strip()
            return json.loads(clean)
        except:
            return {"error": "Failed to parse AI response", "raw": text}
