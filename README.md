# VECTOR AI Platform


LIVE DEMO:https://vector-ai-platform-gamma.vercel.app/




A futuristic AI-powered educational platform combining Web3 authentication, skill verification, and personalized career guidance.

## 🚀 Features

- **3D Holographic Landing Page** - Cyberpunk-inspired UI with rotating data cube
- **AI Career Guidance** - Gemini 2.5 Flash powered department and role suggestions
- **Real-time Hackathon Discovery** - Google Search grounding for live opportunities
- **Multi-format Learning Converter** - Audio, PDF, and image to structured notes
- **AI-Generated Quizzes** - Automatic assessment creation from learning content
- **Skill Verification System** - AI-audited proof-of-skill authentication
- **Web3 Wallet Integration** - MetaMask authentication
- **Learning Diary** - Track and analyze your educational journey

## 🛠️ Tech Stack

### Frontend
- React + Vite
- Framer Motion (animations)
- Glassmorphism UI design
- CSS3 with 3D transforms

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- Google Gemini AI (2.5 Flash)
- Whisper (audio transcription)
- Tesseract OCR (image processing)
- PyMuPDF (PDF parsing)

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- FFmpeg (for audio processing)

### Frontend Setup
```bash
npm install
npm run dev
```

### Backend Setup
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## 🔑 Environment Variables

Create a `.env` file in the server directory:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🎨 UI Highlights

- **Neon Gradients** - Cyan/purple color scheme
- **3D Animations** - Rotating tesseract, floating elements
- **Glass Morphism** - Frosted glass cards with backdrop blur
- **Responsive Design** - Mobile-first approach

## 🤖 AI Features

1. **Department Suggestion** - Analyzes learning patterns to recommend academic streams
2. **Role Prediction** - Extrapolates career paths from current skills
3. **Opportunity Matching** - Real-time hackathon and competition discovery
4. **Content Analysis** - Automatic topic extraction and quiz generation

## 📝 License

MIT License - See LICENSE file for details

## 👥 Contributors

Built with ❤️ by the VECTOR team
