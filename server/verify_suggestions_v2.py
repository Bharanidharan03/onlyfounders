from google import genai
from google.genai import types
import json
import time

# Using the Gemini API key provided by the user
api_key = "AIzaSyBTheteGZqWsGU0nDIAGXBv4YkHeqYW8u4"

def test_live_suggestions():
    client = genai.Client(api_key=api_key, http_options={'api_version': 'v1beta'})
    
    # Target topics from user's journal
    interests = ["machine learning", "python", "data science"]
    interests_str = ", ".join(interests)
    
    prompt = f"""
    Find 3 REAL, ONGOING hackathons or workshops for February 2026.
    Platforms: Unstop, Devfolio, HackerRank.
    Interests: {interests_str}
    
    Return ONLY a JSON list of objects:
    [
      {{
        "title": "Title",
        "description": "Short desc",
        "link": "URL"
      }}
    ]
    """
    
    models_to_try = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-2.0-flash-lite-preview-02-05']
    
    for model_name in models_to_try:
        print(f"--- Testing Model: {model_name} ---")
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    tools=[types.Tool(google_search=types.GoogleSearch())],
                    temperature=0.1
                )
            )
            print("GENAI RESPONSE:")
            print(response.text)
            return # Success
        except Exception as e:
            print(f"ERROR with {model_name}: {e}")
            time.sleep(2)

if __name__ == "__main__":
    test_live_suggestions()
