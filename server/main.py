from fastapi import FastAPI, HTTPException, Depends, Body, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from models import SessionLocal, User, Skill, LearningProgress, AILog, JournalEntry, QuizAttempt
from engine import VectorEngine, SkillEngine, CareerEngine, NetworkingEngine
from journal_engine import JournalEngine
from suggestions_engine import SuggestionEngine
from guidance_engine import GuidanceEngine
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import base64
import tempfile
from multi_format_to_json import MultiFormatConverter
from werkzeug.utils import secure_filename

app = FastAPI(title="VECTOR AI System API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Engines
vector_engine = VectorEngine()
skill_engine = SkillEngine()
career_engine = CareerEngine()
networking_engine = NetworkingEngine()
converter_engine = MultiFormatConverter()
journal_engine = JournalEngine()
suggestion_engine = SuggestionEngine()
guidance_engine = GuidanceEngine()

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Schemas ---
class AuthRequest(BaseModel):
    wallet_address: str
    signature: str

class ProfileUpdate(BaseModel):
    name: str
    role: str
    level: str
    department: Optional[str] = None
    interests: List[str]

class DoubtRequest(BaseModel):
    wallet_address: str
    query: str
    class_val: int
    subject: str
    chapter: str

class SkillSubmission(BaseModel):
    wallet_address: str
    skill_name: str
    category: str
    proof_content: Optional[str] = "None"
    quiz_data: Optional[dict] = {}
    project_info: Optional[str] = "None"
    behavior_data: Optional[dict] = {}

# --- Endpoints ---

@app.post("/auth")
def auth(req: AuthRequest, db: Session = Depends(get_db)):
    # MetaMask simulation: In a real app, verify signature here
    user = db.query(User).filter(User.wallet_address == req.wallet_address).first()
    if not user:
        user = User(wallet_address=req.wallet_address, name="New Explorer")
        db.add(user)
        db.commit()
    return {"status": "authenticated", "onboarding_complete": user.onboarding_complete, "user": user}

@app.get("/get-curriculum/{class_val}")
def get_curriculum(class_val: str):
    data_dir = "./data"
    subjects = {}
    for filename in os.listdir(data_dir):
        if filename.endswith(".json"):
            with open(os.path.join(data_dir, filename), 'r') as f:
                notes = json.load(f)
                for note in notes:
                    if str(note["class"]) == class_val:
                        subj = note["subject"]
                        if subj not in subjects:
                            subjects[subj] = []
                        if note["chapter"] not in subjects[subj]:
                            subjects[subj].append(note["chapter"])
    return subjects

@app.get("/get-note-content")
def get_note_content(class_val: str, subject: str, chapter: str):
    data_dir = "./data"
    for filename in os.listdir(data_dir):
        if filename.endswith(".json"):
            with open(os.path.join(data_dir, filename), 'r') as f:
                notes = json.load(f)
                for note in notes:
                    if str(note["class"]) == class_val and note["subject"] == subject and note["chapter"] == chapter:
                        return {"content": note["content"]}
    return {"content": "Chapter content not found."}

@app.post("/update-profile")
def update_profile(wallet_address: str, profile: ProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.wallet_address == wallet_address).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.name = profile.name
    user.role = profile.role
    user.level = profile.level
    user.department = profile.department
    user.interests = profile.interests
    user.onboarding_complete = 1
    db.commit()
    db.refresh(user)
    return {"status": "success", "user": user}

@app.post("/solve-doubt")
def solve_doubt(req: DoubtRequest, db: Session = Depends(get_db)):
    try:
        if not os.path.exists("./vector_db") and os.path.exists("./data"):
            vector_engine.initialize_db()
        
        answer = vector_engine.solve_doubt(req.query, req.class_val, req.subject, req.chapter)
        
        # Log the AI interaction
        log = AILog(wallet_address=req.wallet_address, type="Doubt", query=req.query, response=str(answer))
        db.add(log)
        db.commit()
        
        return {"answer": answer}
    except Exception as e:
        print(f"CRITICAL ERROR in /solve-doubt: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/submit-skill")
async def submit_skill(
    wallet_address: str = Form(...),
    skill_name: str = Form(...),
    category: str = Form(...),
    project_info: str = Form("None"),
    quiz_answer: str = Form("None"),
    effort: str = Form("medium"),
    cert_text: str = Form("None"),
    certificate_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # 1. Anti-Gaming Duplicate Check
    existing = db.query(Skill).filter(
        Skill.wallet_address == wallet_address,
        Skill.skill_name == skill_name
    ).first()
    
    if existing and existing.status == "Verified":
        return {"verification_status": "Skipped", "verification_score": existing.score, "reason": "Skill already verified for this identity. Duplicate submissions ignored."}

    # Combined filename and text for AI context
    proof_content = f"Text: {cert_text}\n" if cert_text != "None" else ""
    if certificate_file:
        proof_content += f"Uploaded File: {certificate_file.filename}"
    
    # AI Multi-Signal Verification
    verification = skill_engine.verify_skill_claim({
        "skill_name": skill_name,
        "proof_content": proof_content,
        "quiz_data": {"answer": quiz_answer},
        "project_info": project_info
    })
    
    status = verification.get('verification_status', 'Rejected')
    score = float(verification.get('verification_score', 0))

    if existing:
        existing.status = status
        existing.score = score
        existing.proof_content = f"{proof_content} | Updated"
    else:
        skill = Skill(
            wallet_address=wallet_address,
            skill_name=skill_name,
            category=category,
            proof_type="File-Verified" if certificate_file else "Manual-Verified",
            proof_content=f"{proof_content} | Proj: {project_info[:50]}...",
            score=score,
            status=status
        )
        db.add(skill)
    
    db.commit()
    return verification

@app.get("/get-user-data/{wallet_address}")
def get_user_data(wallet_address: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.wallet_address == wallet_address).first()
    skills = db.query(Skill).filter(Skill.wallet_address == wallet_address).all()
    logs = db.query(AILog).filter(AILog.wallet_address == wallet_address).order_by(AILog.timestamp.desc()).limit(10).all()
    
    # Calculate Global V-Score (Alternative GPA)
    verified_skills = [s for s in skills if s.status in ["Verified", "Partially Verified"]]
    overall_score = 0
    if verified_skills:
        overall_score = sum(s.score for s in verified_skills) / len(verified_skills)
    
    return {
        "profile": user,
        "skills": skills,
        "recent_logs": logs,
        "v_score": round(overall_score, 1)
    }

@app.post("/get-career-guidance")
def career_guidance(wallet_address: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.wallet_address == wallet_address).first()
    skills = db.query(Skill).filter(Skill.wallet_address == wallet_address).all()
    
    profile_summary = {
        "role": user.role,
        "level": user.level,
        "interests": user.interests,
        "skills": [s.skill_name for s in skills if s.status == "Verified"]
    }
    
    guidance = career_engine.get_recommendation(profile_summary)
    
    # Log guidance
    log = AILog(wallet_address=wallet_address, type="Career", query="Generate Guidance", response=guidance)
    db.add(log)
    db.commit()
    
    return {"recommendation": guidance}

@app.get("/network-matches/{wallet_address}")
def network_matches(wallet_address: str, db: Session = Depends(get_db)):
    target_user = db.query(User).filter(User.wallet_address == wallet_address).first()
    others = db.query(User).filter(User.wallet_address != wallet_address).all()
    
    if not target_user or not others:
        return {"matches": []}
    
    target_profile = {"id": target_user.wallet_address, "name": target_user.name, "description": f"{target_user.role} interested in {', '.join(target_user.interests)}"}
    candidates = [{"id": u.wallet_address, "name": u.name, "description": f"{u.role} interested in {', '.join(u.interests)}"} for u in others]
    
    matches = networking_engine.match_users(target_profile, candidates)
    return {"matches": matches}

# --- Converter Endpoints ---

@app.post("/converter/upload")
async def converter_upload(
    wallet_address: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Handle file uploads for conversion and create journal entry"""
    try:
        uploads_dir = "./uploads"
        os.makedirs(uploads_dir, exist_ok=True)
        
        file_ext = os.path.splitext(file.filename)[1].lower()
        allowed_extensions = ['.mp3', '.wav', '.m4a', '.flac', '.pdf', '.jpg', '.jpeg', '.png', '.bmp']
        
        if file_ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail=f"File type not supported. Allowed: {', '.join(allowed_extensions)}")
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(uploads_dir, filename)
        
        with open(filepath, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        try:
            result = converter_engine.convert_to_json(filepath, output_path=None)
            
            # Create Journal Entry
            content_text = ""
            if 'text' in result and result['text']:
                content_text = result['text']
            elif 'full_text' in result and result['full_text']:
                content_text = result['full_text']
            
            # Analyze content for heading and topics
            entry_type = 'pdf' if file_ext == '.pdf' else ('image' if file_ext in ['.jpg', '.jpeg', '.png', '.bmp'] else 'audio')
            
            if entry_type == 'image':
                analysis = journal_engine.analyze_image_content(content_text)
                heading = analysis['heading']
                topics = analysis['topics']
            else:
                heading = journal_engine.generate_heading(content_text, entry_type)
                topics = journal_engine.extract_topics(content_text)
            
            new_entry = JournalEntry(
                wallet_address=wallet_address,
                heading=heading,
                content=content_text,
                content_type=entry_type,
                extracted_topics=topics
            )
            db.add(new_entry)
            db.commit()
            db.refresh(new_entry)

            # Generate Quiz for the frontend
            quiz = journal_engine.generate_questions(content_text, topics)
            
            if os.path.exists(filepath):
                os.remove(filepath)
            
            return {
                "success": True,
                "data": result,
                "entry_id": new_entry.id,
                "heading": heading,
                "quiz": quiz
            }
        
        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/converter/live-voice")
async def converter_live_voice(
    wallet_address: str = Body(..., embed=True),
    audio: str = Body(...),
    db: Session = Depends(get_db)
):
    """Handle live voice recording and create journal entry"""
    try:
        if ',' in audio:
            audio_data = audio.split(',')[1]
        else:
            audio_data = audio
        
        audio_bytes = base64.b64decode(audio_data)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_webm:
            temp_webm.write(audio_bytes)
            temp_webm_path = temp_webm.name
        
        temp_wav_path = temp_webm_path.replace('.webm', '_converted.wav')
        
        try:
            from pydub import AudioSegment
            audio_seg = AudioSegment.from_file(temp_webm_path)
            audio_seg = audio_seg.set_frame_rate(16000).set_channels(1)
            audio_seg.export(temp_wav_path, format='wav', parameters=['-acodec', 'pcm_s16le'])
            
            result = converter_engine.convert_to_json(temp_wav_path, output_path=None)
            content_text = result.get('text', '')
            
            heading = journal_engine.generate_heading(content_text, 'audio')
            topics = journal_engine.extract_topics(content_text)
            
            new_entry = JournalEntry(
                wallet_address=wallet_address,
                heading=heading,
                content=content_text,
                content_type='audio',
                extracted_topics=topics
            )
            db.add(new_entry)
            db.commit()
            db.refresh(new_entry)
            
            quiz = journal_engine.generate_questions(content_text, topics)
            
            # Clean up
            if os.path.exists(temp_webm_path): os.remove(temp_webm_path)
            if os.path.exists(temp_wav_path): os.remove(temp_wav_path)
            
            return {
                "success": True,
                "data": result,
                "entry_id": new_entry.id,
                "heading": heading,
                "quiz": quiz
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/converter/text-input")
async def converter_text_input(
    wallet_address: str = Body(..., embed=True),
    text: str = Body(...),
    db: Session = Depends(get_db)
):
    """Handle text input and create journal entry"""
    try:
        result = converter_engine.process_text(text, output_path=None)
        
        heading = journal_engine.generate_heading(text, 'text')
        topics = journal_engine.extract_topics(text)
        
        new_entry = JournalEntry(
            wallet_address=wallet_address,
            heading=heading,
            content=text,
            content_type='text',
            extracted_topics=topics
        )
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)
        
        quiz = journal_engine.generate_questions(text, topics)
        
        return {
            "success": True,
            "data": result,
            "entry_id": new_entry.id,
            "heading": heading,
            "quiz": quiz
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/journal/entries/{wallet_address}")
def get_journal_entries(wallet_address: str, db: Session = Depends(get_db)):
    entries = db.query(JournalEntry).filter(JournalEntry.wallet_address == wallet_address).order_by(JournalEntry.timestamp.desc()).all()
    return entries

@app.post("/suggestions")
def get_suggestions(wallet_address: str = Body(...), manual_interest: Optional[str] = Body(None), db: Session = Depends(get_db)):
    # Fetch user topics from journal
    entries = db.query(JournalEntry).filter(JournalEntry.wallet_address == wallet_address).order_by(JournalEntry.timestamp.desc()).limit(10).all()
    
    extracted_interests = []
    for entry in entries:
        if entry.extracted_topics:
            extracted_interests.extend(entry.extracted_topics)
    
    # Remove duplicates
    extracted_interests = list(set(extracted_interests))
    
    # Generate suggestions
    suggestions = suggestion_engine.generate_suggestions(extracted_interests, manual_interest)
    return {"suggestions": suggestions}

@app.post("/guidance/department")
def get_department_suggestion(wallet_address: str = Body(..., embed=True), db: Session = Depends(get_db)):
    try:
        entries = db.query(JournalEntry).filter(JournalEntry.wallet_address == wallet_address).order_by(JournalEntry.timestamp.desc()).limit(20).all()
        interests = []
        for entry in entries:
            if isinstance(entry.extracted_topics, list):
                for topic in entry.extracted_topics:
                    if isinstance(topic, str):
                        interests.append(topic)
            elif isinstance(entry.extracted_topics, str):
                 interests.append(entry.extracted_topics)

        # Unique interests
        unique_interests = list(set(interests))
        result = guidance_engine.suggest_department(unique_interests)
        return result
    except Exception as e:
        print(f"Error in Department Guidance: {e}")
        return {"error": str(e), "department": "General Science", "reasoning": "Fallback due to server error."}

@app.post("/guidance/role")
def get_role_suggestion(wallet_address: str = Body(..., embed=True), db: Session = Depends(get_db)):
    try:
        entries = db.query(JournalEntry).filter(JournalEntry.wallet_address == wallet_address).order_by(JournalEntry.timestamp.desc()).limit(20).all()
        interests = []
        for entry in entries:
            if isinstance(entry.extracted_topics, list):
                for topic in entry.extracted_topics:
                    if isinstance(topic, str):
                        interests.append(topic)
            elif isinstance(entry.extracted_topics, str):
                 interests.append(entry.extracted_topics)
                 
        unique_interests = list(set(interests))
        result = guidance_engine.suggest_role(unique_interests)
        return result
    except Exception as e:
        print(f"Error in Role Guidance: {e}")
        return {"error": str(e), "role": "Future Innovator", "reasoning": "Fallback due to server error."}

@app.post("/journal/submit-quiz")
def submit_quiz(
    wallet_address: str = Body(..., embed=True),
    entry_id: int = Body(..., embed=True),
    answers: List[str] = Body(...),
    db: Session = Depends(get_db)
):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    questions = journal_engine.generate_questions(entry.content, entry.extracted_topics)
    evaluation = journal_engine.score_answers(entry.content, questions, answers)
    
    # Save Quiz Attempt
    attempt = QuizAttempt(
        journal_entry_id=entry_id,
        wallet_address=wallet_address,
        questions=questions,
        answers=answers,
        score=evaluation['total_score'],
        feedback=evaluation['overall_feedback']
    )
    db.add(attempt)
    
    # Update Entry
    entry.quiz_generated = 1
    entry.points_earned = evaluation['points_earned']
    
    # Update User Skill/Score (if applicable)
    # We'll use the points_earned to slightly boost V-Index
    # In a real app, you'd map topics to actual Skill records
    
    db.commit()
    return evaluation

# Ensure data dir exists
if not os.path.exists("./data"):
    os.makedirs("./data")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
