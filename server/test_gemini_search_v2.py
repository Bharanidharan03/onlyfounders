import os
import google.generativeai as genai

# Using the Gemini API key provided by the user
api_key = "AIzaSyBTheteGZqWsGU0nDIAGXBv4YkHeqYW8u4"
genai.configure(api_key=api_key)

print("--- Testing Gemini 2.5 Flash with 'google_search' tool ---")
try:
    # Trying the 'google_search' tool name specifically requested by the error
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        tools=[{"google_search": {}}]
    )
    
    prompt = "Search for 3 real, currently open hackathons on Unstop or Devfolio for February 2026. Provide their exact names and URLs."
    response = model.generate_content(prompt)
    print("RESPONSE CONTENT:")
    print(response.text)
    
    if hasattr(response.candidates[0], 'grounding_metadata') and response.candidates[0].grounding_metadata:
        print("\nGROUNDING METADATA FOUND!")
    else:
        print("\nNO GROUNDING METADATA")

except Exception as e:
    print(f"ERROR: {e}")
