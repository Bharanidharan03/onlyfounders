import os
import google.generativeai as genai

# Using the Gemini API key provided by the user
api_key = "AIzaSyBTheteGZqWsGU0nDIAGXBv4YkHeqYW8u4"
genai.configure(api_key=api_key)

print("--- Testing gemini-flash-latest with Grounding ---")
try:
    model = genai.GenerativeModel(
        model_name='gemini-flash-latest',
        tools=[{"google_search_retrieval": {}}]
    )
    response = model.generate_content("Find 3 live hackathons in 2026")
    print(f"RESPONSE: {response.text}")
except Exception as e:
    print(f"ERROR: {e}")
