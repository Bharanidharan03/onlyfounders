from google import genai
from google.genai import types
import json

# Using the Gemini API key provided by the user
api_key = "AIzaSyBTheteGZqWsGU0nDIAGXBv4YkHeqYW8u4"

def test_live_suggestions():
    client = genai.Client(api_key=api_key, http_options={'api_version': 'v1beta'})
    
    # Target topics from user's journal
    interests = ["machine learning", "python", "data science"]
    interests_str = ", ".join(interests)
    
    prompt = f"""
    Find 5 REAL, ONGOING hackathons or workshops for February 2026.
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
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
                temperature=0.1
            )
        )
        print("GENAI RESPONSE:")
        print(response.text)
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_live_suggestions()
