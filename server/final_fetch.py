from google import genai
from google.genai import types
import json

# Using the Gemini API key provided by the user
api_key = "AIzaSyBTheteGZqWsGU0nDIAGXBv4YkHeqYW8u4"

def get_final_suggestions():
    client = genai.Client(api_key=api_key, http_options={'api_version': 'v1beta'})
    
    # Target topics from user's journal
    interests = ["machine learning", "python", "data science"]
    interests_str = ", ".join(interests)
    
    prompt = f"""
    Find 5 REAL, CURRENTLY OPEN hackathons or technical workshops on Unstop or Devfolio for February 2026.
    Focus on these interests: {interests_str}.
    Provide their EXACT titles, specific dates, and direct registration links.
    
    Return as a JSON array of objects.
    """
    
    # Try 2.0-flash-lite as it might have better availability
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash-lite',
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
                temperature=0.7
            )
        )
        print("RESULT:")
        print(response.text)
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    get_final_suggestions()
