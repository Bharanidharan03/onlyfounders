import os
import google.generativeai as genai

# Using the Gemini API key provided by the user
api_key = "AIzaSyBTheteGZqWsGU0nDIAGXBv4YkHeqYW8u4"
genai.configure(api_key=api_key)

print("--- Testing gemini-flash-latest ---")
try:
    model = genai.GenerativeModel('gemini-flash-latest')
    response = model.generate_content("Say hello")
    print(f"RESPONSE: {response.text}")
except Exception as e:
    print(f"ERROR: {e}")
