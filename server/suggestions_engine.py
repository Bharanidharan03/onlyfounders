import os
import json
import re
from typing import Dict, List, Any
from google import genai
from google.genai import types

class SuggestionEngine:
    def __init__(self):
        # Using the Gemini API key provided by the user
        self.api_key = os.getenv("GOOGLE_API_KEY", "AIzaSyCSMxvCyT8maRizUik4Ia13hu9VFGEsDfs")
        
        # Initialize Google GenAI Client
        try:
            self.client = genai.Client(
                api_key=self.api_key, 
                http_options={'api_version': 'v1beta'}
            )
            # Tiered model strategy: Confirmed models from list_models.py
            self.primary_model = "gemini-2.5-flash"
            self.fallback_models = ["gemini-2.0-flash", "gemini-2.5-pro"]
        except Exception as e:
            print(f"GenAI Initialization Error: {e}")
            self.client = None

    def generate_suggestions(self, personal_interests: List[str], manual_interest: str = None) -> List[Dict[str, Any]]:
        """
        Produce a broad list of REAL-WORLD hackathons and events.
        If API quota is hit, generates dynamic direct search links for Unstop/Devfolio.
        """
        if not self.client:
            return self._get_dynamic_fallbacks(personal_interests, manual_interest)

        import random
        from datetime import datetime
        
        # Combine interests
        all_interests = personal_interests
        if manual_interest:
            all_interests.append(manual_interest)
        
        all_interests = list(set([i.strip().lower() for i in all_interests if i]))
        
        # Variety: If we have many interests, pick a random subset to get fresh results
        if len(all_interests) > 3:
            search_interests = random.sample(all_interests, 3)
        else:
            search_interests = all_interests
            
        interests_str = ", ".join(search_interests)
        if not interests_str:
            interests_str = "Coding, AI, Web3, Hackathons"

        current_date = datetime.now().strftime("%B %Y")

        # Explicitly ask for MORE results (10) and target Unstop/Devfolio with variety
        prompt = f"""
        TASK:
        Find 10 DIFFERENT, LIVE hackathons or technical competitions as of {current_date}.
        Target specifically: Unstop, Devfolio, and HackerRank.
        
        USER TOPICS: {interests_str}
        
        INSTRUCTIONS:
        1. Search for a variety of live events (up to 10).
        2. Filter for those that match the interests: {interests_str}.
        3. Get EXACT registration URLs from Unstop or Devfolio.
        4. Do NOT repeat the same popular events if others are available.
        
        RESPONSE FORMAT (STRICT JSON ARRAY ONLY):
        [
          {{
            "title": "Exact Event Name",
            "type": "Hackathon | Workshop | Contest",
            "description": "Short matching reason",
            "difficulty": "Beginner | Intermediate | Advanced",
            "reward": "e.g. 100 V-Points + Prize Pool",
            "link": "https://unstop.com/hiring-challenges/... or https://devfolio.co/hackathons/..."
          }}
        ]
        
        IMPORTANT: Return ONLY the JSON array.
        """

        models_to_try = [self.primary_model] + self.fallback_models
        
        for model_name in models_to_try:
            try:
                # Request generation with Search Grounding
                response = self.client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        tools=[types.Tool(google_search=types.GoogleSearch())],
                        temperature=0.7
                    )
                )
                
                content = response.text
                content = re.sub(r'```json', '', content)
                content = re.sub(r'```', '', content)
                
                match = re.search(r'\[.*\]', content, re.DOTALL)
                if match:
                    clean_json_str = match.group(0)
                    clean_json_str = re.sub(r',\s*\}', '}', clean_json_str)
                    clean_json_str = re.sub(r',\s*\]', ']', clean_json_str)
                    suggestions = json.loads(clean_json_str)
                    
                    if isinstance(suggestions, list) and len(suggestions) > 0:
                        return suggestions

            except Exception as e:
                # If it's a 429 (Quota), we try the next model in the cascade
                if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                    print(f"Model {model_name} Quota Exceeded. Trying next model...")
                    continue
                else:
                    print(f"GenAI Error with {model_name}: {e}")
                    break

        return self._get_dynamic_fallbacks(personal_interests, manual_interest)

    def _get_dynamic_fallbacks(self, personal_interests: List[str], manual_interest: str = None) -> List[Dict[str, Any]]:
        """
        Generates dynamic search links when the AI is rate-limited.
        """
        main_topic = manual_interest if manual_interest else (personal_interests[0] if personal_interests else "hackathons")
        safe_topic = re.sub(r'[^a-zA-Z0-9]', '%20', main_topic)
        
        return [
            {
                "title": f"Live {main_topic.title()} Events on Unstop",
                "type": "Neural Deep-Link",
                "description": f"AI Grounding is cooling down. Click here to see the FULL live catalog for '{main_topic}' directly on Unstop.",
                "difficulty": "All Levels",
                "reward": "100-2000 V-Points",
                "link": f"https://unstop.com/search?q={safe_topic}&type=hackathons"
            },
            {
                "title": f"Devfolio: {main_topic.title()} Hackathons",
                "type": "Neural Deep-Link",
                "description": "Direct access to the Devfolio global ecosystem for your specific interests.",
                "difficulty": "Intermediate/Advanced",
                "reward": "Global Recognition",
                "link": f"https://devfolio.co/hackathons?q={safe_topic}"
            },
            {
                "title": "MLH Season 2026",
                "type": "Hackathon",
                "description": "The official world-wide student hacking league. View all upcoming events for the 2026 season.",
                "difficulty": "Beginner",
                "reward": "World-Class Exposure",
                "link": "https://mlh.io/seasons/2026/events"
            }
        ]
