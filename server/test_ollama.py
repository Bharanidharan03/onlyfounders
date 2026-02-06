from langchain_ollama import OllamaLLM
try:
    llm = OllamaLLM(model="phi3:mini", base_url="http://localhost:11434")
    res = llm.invoke("Hi")
    print(f"Ollama Res: {res}")
except Exception as e:
    print(f"Ollama Error: {e}")
