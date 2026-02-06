# VECTOR AI Platform 🚀

-----------------------------------------------------------------
**LIVE DEMO**: [onlyfounders.onrender.com](https://onlyfounders.onrender.com/)
**LIVE DEMO**: [vector-ai-platform-gamma.vercel.app](https://vector-ai-platform-gamma.vercel.app/)


-----------------------------------------------------------------

A futuristic AI-powered educational platform combining Web3 authentication, skill verification, and personalized career guidance.

## 🚀 Quick Start (Easiest Method)

If you have Node.js and Python installed, you can start everything with a single command:

```bash
# 1. Clone the repository
git clone https://github.com/Bharanidharan03/onlyfounders.git
cd onlyfounders

# 2. Install dependencies (First time only)
npm install

# 3. Start Frontend & Backend together
npm run dev:all
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000

---

## 🛠️ Tech Stack

### Frontend
- **React + Vite** - High-performance core
- **Framer Motion** - 3D animations and transitions
- **Glassmorphism UI** - Modern premium aesthetic
- **Three.js / React Three Fiber** - 3D data visualizations

### Backend
- **FastAPI (Python)** - High-performance API framework
- **LangChain** - Orchestration for AI models
- **Google Gemini 2.5 Flash** - Primary LLM for guidance and suggestions
- **Ollama (Optional)** - Local AI support
- **Local Embeddings** - Sentence-Transformers (all-MiniLM-L6-v2) for zero-dependency search

---

## 🤖 AI Features (Smart Fallbacks)

This project is designed to work out-of-the-box. It uses a **tiered AI strategy**:
1. **Primary**: If you have **Ollama** running locally, it will use local models (`phi3`).
2. **Fallback**: If Ollama is not found, it automatically switches to **Google Gemini 2.5 Flash** for logic and **Local Sentence-Transformers** for data processing.

---

## ⚙️ Manual Configuration (Optional)

### Environment Variables
For production or higher limits, add your API key to a `.env` file in the root or `server/` directory:
```env
GEMINI_API_KEY=your_google_ai_key_here
```

### Prerequisite Checklist
- **Node.js 18+**
- **Python 3.11+**
- **FFmpeg** (Optional: Required for live voice recording)

## 🎨 Project Structure

- `/src` - React frontend application
- `/server` - Python FastAPI backend and AI engines
- `/data` - Knowledge base for the vector search

## 📝 License
Built with ❤️ for the future of education.
