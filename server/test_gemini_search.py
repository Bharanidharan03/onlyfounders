import os
import google.generativeai as genai

# Using the Gemini API key provided by the user
api_key = "AIzaSyBTheteGZqWsGU0nDIAGXBv4YkHeqYW8u4"
genai.configure(api_key=api_key)

print("--- Testing Gemini 2.5 Flash with Search ---")
try:
    # Based on the user's available models list (Step 667)
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        tools=[{"google_search_retrieval": {}}]
    )
    
    prompt = "Find 3 LIVE hackathons happening in February 2026 on Unstop or Devfolio. Return as JSON array."
    response = model.generate_content(prompt)
    print("RESPONSE CONTENT:")
    print(response.text)
    
    if response.candidates[0].grounding_metadata:
        print("\nGROUNDING METADATA FOUND!")
    else:
        print("\nNO GROUNDING METADATA (Search might not have triggered)")

except Exception as e:
    print(f"ERROR: {e}")
