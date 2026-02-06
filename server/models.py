from sqlalchemy import Column, String, Float, Integer, JSON, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy import create_engine
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    wallet_address = Column(String, primary_key=True)
    name = Column(String)
    role = Column(String) # School Student / College Student
    level = Column(String) # Class / Year
    department = Column(String)
    interests = Column(JSON)
    skills_matrix = Column(JSON, default={})
    onboarding_complete = Column(Integer, default=0)

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, autoincrement=True)
    wallet_address = Column(String, ForeignKey("users.wallet_address"))
    skill_name = Column(String)
    category = Column(String)
    score = Column(Float, default=0.0)
    status = Column(String, default="Pending") # Pending, Verified, Rejected
    proof_type = Column(String)
    proof_content = Column(String)

class LearningProgress(Base):
    __tablename__ = "learning_progress"
    id = Column(Integer, primary_key=True, autoincrement=True)
    wallet_address = Column(String, ForeignKey("users.wallet_address"))
    class_val = Column(Integer)
    subject = Column(String)
    chapter = Column(String)
    progress = Column(Float, default=0.0)

class AILog(Base):
    __tablename__ = "ai_logs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    wallet_address = Column(String, ForeignKey("users.wallet_address"))
    type = Column(String) # Doubt, Career, Skill
    query = Column(String)
    response = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    id = Column(Integer, primary_key=True, autoincrement=True)
    wallet_address = Column(String, ForeignKey("users.wallet_address"))
    heading = Column(String)  # AI-generated heading
    content = Column(String)  # Original text/transcription
    content_type = Column(String)  # text, audio, image, pdf
    extracted_topics = Column(JSON)  # AI-extracted learning topics
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    quiz_generated = Column(Integer, default=0)  # 0 = pending, 1 = completed
    points_earned = Column(Float, default=0.0)

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id = Column(Integer, primary_key=True, autoincrement=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"))
    wallet_address = Column(String, ForeignKey("users.wallet_address"))
    questions = Column(JSON)  # List of questions
    answers = Column(JSON)  # User's answers
    score = Column(Float, default=0.0)  # Quiz score
    feedback = Column(String)  # AI feedback
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

engine = create_engine("sqlite:///./vector_base.db")
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
