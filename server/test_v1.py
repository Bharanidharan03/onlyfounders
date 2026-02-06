import os
import google.generativeai as genai

# Using the Gemini API key provided by the user
api_key = "AIzaSyBTheteGZqWsGU0nDIAGXBv4YkHeqYW8u4"
genai.configure(api_key=api_key)

print("--- Testing Gemini 1.5 Flash (Standard v1) ---")
try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Say hello")
    print(f"RESPONSE: {response.text}")
except Exception as e:
    print(f"ERROR: {e}")
