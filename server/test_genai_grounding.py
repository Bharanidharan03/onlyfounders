import os
from google import genai
from google.genai import types

# Using the Gemini API key provided by the user
api_key = "AIzaSyBTheteGZqWsGU0nDIAGXBv4YkHeqYW8u4"

print("--- Testing New google-genai SDK with Gemini 2.5 Flash + Search ---")

try:
    # Initialize client (using v1beta for newest models)
    client = genai.Client(api_key=api_key, http_options={'api_version': 'v1beta'})
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents='Search for 3 currently live hackathons on Unstop or Devfolio for February 2026. Provide exact names and URLs.',
        config=types.GenerateContentConfig(
            tools=[types.Tool(google_search=types.GoogleSearch())]
        )
    )
    
    print("RESPONSE CONTENT:")
    print(response.text)
    
    # Check for grounding
    if response.candidates[0].grounding_metadata:
        print("\nGROUNDING SUCCESSFUL! Live search data was potentially used.")
        # print(response.candidates[0].grounding_metadata)
    else:
        print("\nNO GROUNDING METADATA.")

except Exception as e:
    print(f"ERROR: {e}")
