"""
Multi-Format to JSON Converter
Supports: MP3, PDF, JPG, and Live Voice input
"""

import json
import os
import platform
import base64
from pathlib import Path
from typing import Dict, Any, Optional

# Core processing libraries
import speech_recognition as sr
from pydub import AudioSegment
from PIL import Image
import PyPDF2
import pytesseract

# Set Tesseract path for Windows
if platform.system() == "Windows":
    # Common default installation paths
    tesseract_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        os.path.join(os.getenv('LOCALAPPDATA', ''), r'Programs\Tesseract-OCR\tesseract.exe')
    ]
    
    for path in tesseract_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            break

class MultiFormatConverter:
    def __init__(self):
        """Initialize the converter with necessary components"""
        self.supported_formats = {
            'audio': ['.mp3', '.wav', '.m4a', '.flac'],
            'document': ['.pdf'],
            'image': ['.jpg', '.jpeg', '.png', '.bmp']
        }
    
    def _save_json(self, data: Dict[str, Any], output_path: str) -> None:
        """
        Helper method to append data to existing JSON file or create new one.
        Maintains a list of entries.
        """
        existing_data = []
        if os.path.exists(output_path):
            try:
                with open(output_path, 'r', encoding='utf-8') as f:
                    content = json.load(f)
                    if isinstance(content, list):
                        existing_data = content
                    elif isinstance(content, dict):
                        existing_data = [content]
            except json.JSONDecodeError:
                # File might be empty or corrupted, start fresh
                existing_data = []
        
        existing_data.append(data)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, indent=2, ensure_ascii=False)
        print(f"JSON appended to: {output_path}")

    def convert_to_json(self, input_path: str, output_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Main method to convert any supported format to JSON
        
        Args:
            input_path: Path to input file
            output_path: Optional path to save JSON output
            
        Returns:
            Dictionary with extracted information
        """
        file_ext = Path(input_path).suffix.lower()
        
        # Determine input type and process accordingly
        if file_ext in self.supported_formats['audio']:
            result = self._process_audio(input_path)
        elif file_ext in self.supported_formats['document']:
            result = self._process_pdf(input_path)
        elif file_ext in self.supported_formats['image']:
            result = self._process_image(input_path)
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
        
        # Add metadata
        result['metadata'] = {
            'source_file': os.path.basename(input_path),
            'file_type': file_ext,
            'processing_method': result.get('processing_method', 'unknown')
        }
        
        # Save to file if output path provided
        if output_path:
            self._save_json(result, output_path)
        
        return result
    
    def _process_audio(self, audio_path: str) -> Dict[str, Any]:
        """
        Convert audio (MP3, WAV, etc.) to text using speech recognition
        """
        try:
            
            # Convert MP3 to WAV if needed
            file_ext = Path(audio_path).suffix.lower()
            if file_ext == '.mp3':
                audio = AudioSegment.from_mp3(audio_path)
                wav_path = audio_path.replace('.mp3', '_temp.wav')
                audio.export(wav_path, format='wav')
                audio_path = wav_path
                temp_file = True
            else:
                temp_file = False
            
            # Recognize speech
            recognizer = sr.Recognizer()
            recognizer.energy_threshold = 300  # Adjust for background noise
            recognizer.dynamic_energy_threshold = True
            
            with sr.AudioFile(audio_path) as source:
                audio_data = recognizer.record(source)
                try:
                    text = recognizer.recognize_google(audio_data)
                except sr.UnknownValueError:
                    raise Exception("Speech recognition could not understand the audio. Please speak more clearly.")
                except sr.RequestError as e:
                    raise Exception(f"Could not request results from Google Speech Recognition service; {e}")
            
            # Clean up temp file
            if temp_file and os.path.exists(wav_path):
                os.remove(wav_path)
            
            result = {
                'content_type': 'audio_transcription',
                'text': text,
                'processing_method': 'speech_recognition',
                'word_count': len(text.split())
            }
            
            # Add metadata if not already present
            if 'metadata' not in result:
                result['metadata'] = {
                    'source_file': os.path.basename(audio_path),
                    'file_type': file_ext,
                    'processing_method': 'speech_recognition'
                }
            
            return result
            
        except Exception as e:
            error_msg = str(e)
            if "[WinError 2]" in error_msg:
                error_msg = "FFmpeg not found. Please install FFmpeg to process audio files."
            
            return {
                'content_type': 'audio_transcription',
                'error': error_msg,
                'processing_method': 'speech_recognition',
                'text': None
            }
    
    def _process_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract text from PDF
        """
        try:
            
            text_content = []
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                num_pages = len(pdf_reader.pages)
                
                for page_num in range(num_pages):
                    page = pdf_reader.pages[page_num]
                    extracted = page.extract_text()
                    text_content.append({
                        'page_number': page_num + 1,
                        'text': str(extracted) if extracted else ""
                    })
            
            full_text = ' '.join([str(page['text']) for page in text_content])
            
            return {
                'content_type': 'document',
                'document_type': 'pdf',
                'num_pages': num_pages,
                'pages': text_content,
                'full_text': full_text,
                'processing_method': 'PyPDF2',
                'word_count': len(full_text.split())
            }
            
        except Exception as e:
            return {
                'content_type': 'document',
                'error': str(e),
                'processing_method': 'PyPDF2',
                'text': None
            }
    
    def _process_image(self, image_path: str) -> Dict[str, Any]:
        """
        Extract text from image using OCR
        """
        try:
            
            # Open and process image
            image = Image.open(image_path)
            
            # Extract text using OCR
            text = pytesseract.image_to_string(image)
            
            # Get image metadata
            width, height = image.size
            
            return {
                'content_type': 'image_ocr',
                'text': text,
                'image_properties': {
                    'width': width,
                    'height': height,
                    'format': image.format,
                    'mode': image.mode
                },
                'processing_method': 'tesseract_ocr',
                'word_count': len(text.split())
            }
            
        except Exception as e:
            return {
                'content_type': 'image_ocr',
                'error': str(e),
                'processing_method': 'tesseract_ocr',
                'text': None
            }
    
    def live_voice_to_json(self, duration: int = 5, output_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Record live voice input and convert to JSON
        
        Args:
            duration: Recording duration in seconds
            output_path: Optional path to save JSON output
        """
        try:
            
            recognizer = sr.Recognizer()
            
            print(f"Recording for {duration} seconds... Speak now!")
            
            with sr.Microphone() as source:
                # Adjust for ambient noise
                recognizer.adjust_for_ambient_noise(source, duration=0.5)
                
                # Record audio
                audio = recognizer.listen(source, timeout=duration, phrase_time_limit=duration)
            
            print("Processing audio...")
            
            # Recognize speech
            try:
                text = recognizer.recognize_google(audio)
            except sr.UnknownValueError:
                raise Exception("Speech recognition could not understand the audio. Please speak more clearly.")
            except sr.RequestError as e:
                raise Exception(f"Could not request results from Google Speech Recognition service; {e}")
            
            result = {
                'content_type': 'live_voice',
                'text': text,
                'processing_method': 'speech_recognition',
                'recording_duration': duration,
                'word_count': len(text.split())
            }
            
            # Save to file if output path provided
            if output_path:
                self._save_json(result, output_path)
            
            return result
            
        except Exception as e:
            return {
                'content_type': 'live_voice',
                'error': str(e),
                'processing_method': 'speech_recognition',
                'text': None
            }


    def process_text(self, text: str, output_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Process direct text input and return structured JSON
        
        Args:
            text: Input text
            output_path: Optional path to save JSON output
        """
        result = {
            'content_type': 'text_input',
            'text': text,
            'processing_method': 'manual_entry',
            'word_count': len(text.split()) if text else 0,
            'metadata': {
                'source_file': 'manual_entry',
                'file_type': 'text',
                'processing_method': 'manual_entry'
            }
        }
        
        # Save to file if output path provided
        if output_path:
            self._save_json(result, output_path)
        
        return result
            
        return result


def main():
    """Example usage"""
    converter = MultiFormatConverter()
    
    print("Multi-Format to JSON Converter")
    print("=" * 50)
    print("\nOptions:")
    print("1. Convert file (MP3, PDF, JPG)")
    print("2. Record live voice")
    print("3. Exit")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == '1':
        input_path = input("Enter the path to your file: ").strip()
        output_path = input("Enter output JSON path (or press Enter for console only): ").strip()
        
        if not output_path:
            output_path = None
        
        try:
            result = converter.convert_to_json(input_path, output_path)
            print("\nResult:")
            print(json.dumps(result, indent=2))
        except Exception as e:
            print(f"Error: {e}")
    
    elif choice == '2':
        duration = input("Enter recording duration in seconds (default 5): ").strip()
        duration = int(duration) if duration else 5
        
        output_path = input("Enter output JSON path (or press Enter for console only): ").strip()
        if not output_path:
            output_path = None
        
        result = converter.live_voice_to_json(duration, output_path)
        print("\nResult:")
        print(json.dumps(result, indent=2))
    
    elif choice == '3':
        print("Goodbye!")
    else:
        print("Invalid choice!")


if __name__ == "__main__":
    main()
