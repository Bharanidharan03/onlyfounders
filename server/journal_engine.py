import json
import re
from typing import Dict, List, Any
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser


class JournalEngine:
    """AI-powered learning journal engine with Ollama integration"""
    
    def __init__(self, model_name="phi3:mini"):
        self.model_name = model_name
        self.api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or "AIzaSyCSMxvCyT8maRizUik4Ia13hu9VFGEsDfs"
        
        try:
            self.llm = OllamaLLM(model=model_name, base_url="http://localhost:11434")
            # Pulse check
            import requests
            requests.get("http://localhost:11434", timeout=1)
        except:
            print("Ollama not found. Falling back to Gemini for JournalEngine.")
            self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=self.api_key)

        self.learning_keywords = [
            'learned', 'studied', 'watched', 'completed', 'finished', 'read',
            'course', 'tutorial', 'video', 'book', 'chapter', 'lesson',
            'certificate', 'project', 'assignment', 'practice', 'exercise'
        ]
    
    def generate_heading(self, content: str, content_type: str) -> str:
        """
        Generate an AI heading for the journal entry
        """
        try:
            prompt = ChatPromptTemplate.from_template("""
            Analyze this learning entry and provide a SHORT, professional heading (max 5 words).
            The heading should follow the format: "Learning: [Topic]" or "Mastery: [Topic]".
            
            ENTRY TYPE: {content_type}
            CONTENT: {content}
            
            Heading:
            """)
            chain = prompt | self.llm | StrOutputParser()
            res = chain.invoke({"content_type": content_type, "content": content[:500]})
            return res.strip().replace('"', '')
        except:
            # Fallback to pattern matching if AI is offline
            topics = self.extract_topics(content)
            if not topics:
                type_map = {'text': 'Daily Learning Log', 'audio': 'Voice Learning Entry', 'image': 'Visual Learning Record', 'pdf': 'Document Study Session'}
                return type_map.get(content_type, 'Learning Journal Entry')
            return f"Learning: {topics[0].title()}"
    
    def extract_topics(self, content: str) -> List[str]:
        """
        Extract learning topics from content using AI
        """
        try:
            prompt = ChatPromptTemplate.from_template("""
            Extract the primary learning subjects from this text. 
            If the text is brief like "I learned [Topic]", just return "[Topic]".
            Return ONLY a comma-separated list of the 2-3 most important technical topics.
            
            CONTENT: {content}
            
            Topics:
            """)
            chain = prompt | self.llm | StrOutputParser()
            res = chain.invoke({"content": content[:800]})
            topics = [t.strip().strip('"').lower() for t in res.split(',')]
            return [t for t in topics if t and len(t) > 2][:5]
        except:
            # Fallback to basic extraction
            content_lower = content.lower()
            topics = []
            patterns = [
                r'(?:learned|studied|watched|read|completed).*?(?:about|on)?\s+([a-z\s]{3,30})',
                r'(?:course|tutorial|video|book).*?(?:on|about)\s+([a-z\s]{3,30})'
            ]
            for pattern in patterns:
                matches = re.findall(pattern, content_lower)
                for match in matches:
                    topic = match.strip()
                    if len(topic) > 3 and topic not in topics:
                        topics.append(topic)
            return list(dict.fromkeys(topics))[:3]
    
    def generate_questions(self, content: str, topics: List[str]) -> List[Dict[str, Any]]:
        """
        Generate contextual quiz questions. If content is thin, challenge the user based on the detected topics.
        """
        try:
            prompt = ChatPromptTemplate.from_template("""
            You are a subject matter expert examiner. 
            The student claims to have learned: {topics}
            Original Log: "{content}"

            TASK: Generate 2-3 technical quiz questions that specifically test knowledge of {topics}. 
            Even if the student's log is short, use your own internal knowledge to ask rigorous questions about {topics}.

            TYPES:
            - 1 Reasoning/Explanation question
            - 1 Fact-based or MCQ question
            
            Return ONLY a JSON array of strings: ["question 1", "question 2", ...]
            """)
            chain = prompt | self.llm | StrOutputParser()
            res = chain.invoke({
                "topics": ", ".join(topics), 
                "content": content[:1500]
            })
            
            # Extract JSON list
            match = re.search(r'\[.*\]', res, re.DOTALL)
            if match:
                qs = json.loads(match.group(0))
                questions = []
                for i, q in enumerate(qs[:3]):
                    questions.append({
                        'id': i + 1,
                        'question': q,
                        'type': 'ai_generated'
                    })
                return questions
        except Exception as e:
            print(f"Question generation error: {e}")
            
        # Fallback to smarter defaults if AI fails
        return [
            {'id': 1, 'question': f"Based on your entry, what was the most important concept you learned?", 'type': 'open_ended'},
            {'id': 2, 'question': f"How would you explain the topics you mentioned to a beginner?", 'type': 'open_ended'}
        ]
    
    def score_answers(self, contents: str, questions: List[Dict], answers: List[str]) -> Dict[str, Any]:
        """
        Score user's answers based on their logged content using AI evaluation.
        STRICT PROTOCOL: Empty, generic, or refusal answers get 0.
        """
        try:
            # Enhanced Pre-filter
            refusal_keywords = ['nothing', 'idk', 'dont know', 'don\'t know', 'none', 'skip', '...', 'na', 'n/a', 'no idea']
            clean_answers = [a.strip().lower() for a in answers if a]
            
            # If no actual answers provided or all answers are refusal keywords or too short
            if not clean_answers or all(len(a) < 10 or any(ref in a for ref in refusal_keywords) for a in clean_answers):
                return {
                    'total_score': 0.0,
                    'feedback_items': [],
                    'overall_feedback': "Verification system detected non-substantive answers. Please provide detailed explanations to verify your learning and earn V-Points.",
                    'points_earned': 0.0
                }

            # If total length of all answers is too low
            total_len = sum(len(a) for a in clean_answers)
            if total_len < 20:
                return {
                    'total_score': 0.0,
                    'feedback_items': [],
                    'overall_feedback': "Answer density too low for verification. Provide more context to prove mastery.",
                    'points_earned': 0.0
                }

            q_and_a = []
            for q, a in zip(questions, answers):
                q_and_a.append(f"Q: {q['question']}\nA: {a}")
            
            prompt = ChatPromptTemplate.from_template("""
            You are an Elite Academic Auditor for the VECTOR system. 
            Evaluate if the student has actually grasped the concepts they logged.

            LOGGED REFERENCE: "{contents}"
            
            USER'S QUIZ RESPONSES:
            {qa_text}
            
            SCORING RULES:
            1. If the answer is "nothing", "idk", or unrelated, score 0 for that question.
            2. If the answer shows deep conceptual understanding, score 80-100.
            3. If the answer is partially correct but lacks detail, score 40-60.
            4. If the log was brief (e.g. "I learned ML") and the user correctly answered a technical question about that topic, give HIGH MARKS.

            Return JSON ONLY:
            {{
              "score": <int 0-100>,
              "feedback": "Crispy feedback for the student",
              "logic": "Why did you give this score?"
            }}
            """)
            chain = prompt | self.llm | StrOutputParser()
            res = chain.invoke({"contents": contents[:1000], "qa_text": "\n\n".join(q_and_a)})
            
            match = re.search(r'\{.*\}', res, re.DOTALL)
            if match:
                eval_data = json.loads(match.group(0))
                score = float(eval_data.get('score', 0))
                return {
                    'total_score': score,
                    'feedback_items': [],
                    'overall_feedback': eval_data.get('feedback', 'Evaluation processed.'),
                    'points_earned': round(score / 10, 1)
                }
        except Exception as e:
            print(f"Scoring error: {e}")

        # Fallback if AI/parsing fails is now 0.0 to prevent unearned points
        return {
            'total_score': 0.0,
            'feedback_items': [],
            'overall_feedback': "Auditor engine timeout. Verification incomplete. System awarded 0 sync points.",
            'points_earned': 0.0
        }
    
    def analyze_image_content(self, ocr_text: str) -> Dict[str, Any]:
        """
        Analyze image content specifically using AI (e.g., certificates)
        """
        try:
            prompt = ChatPromptTemplate.from_template("""
            Analyze this text extracted from an image (likely a certificate or study notes).
            Determine what was achieved and extract the core topic.
            
            TEXT: {ocr_text}
            
            Output strictly as JSON:
            {{
              "is_certificate": true/false,
              "main_topic": "e.g. Python Crash Course",
              "achievement": "e.g. Completion Certificate",
              "heading": "Professional Heading for Journal"
            }}
            """)
            chain = prompt | self.llm | StrOutputParser()
            res = chain.invoke({"ocr_text": ocr_text[:800]})
            match = re.search(r'\{.*\}', res, re.DOTALL)
            if match:
                data = json.loads(match.group(0))
                return {
                    'type': 'certificate' if data.get('is_certificate') else 'notes',
                    'topics': [data.get('main_topic', 'New Skill')],
                    'heading': data.get('heading', 'Visual Learning Entry')
                }
        except:
            pass
            
        return {
            'type': 'notes',
            'topics': self.extract_topics(ocr_text),
            'heading': 'Learning Document Analyzed'
        }
