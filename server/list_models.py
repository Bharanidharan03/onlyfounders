from google import genai

# Using the Gemini API key provided by the user
api_key = "AIzaSyBTheteGZqWsGU0nDIAGXBv4YkHeqYW8u4"

def list_models():
    client = genai.Client(api_key=api_key, http_options={'api_version': 'v1beta'})
    print("Listing Models available for v1beta:")
    try:
        models = client.models.list()
        for model in models:
            # Printing name which is what we need
            print(f"Name: {model.name}")
    except Exception as e:
        print(f"Error listing models: {e}")

if __name__ == "__main__":
    list_models()
