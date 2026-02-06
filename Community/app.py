"""
Flask Web Server for Multi-Format to JSON Converter
Main entry point for the web application
"""

from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.exceptions import HTTPException
import os
import json
import base64
from pathlib import Path
from multi_format_to_json import MultiFormatConverter
import tempfile
import logging
import traceback
from pydub import AudioSegment
import time


# Configure logging
logging.basicConfig(
    filename='error_log.txt',
    level=logging.INFO,
    format='%(asctime)s %(levelname)s: %(message)s'
)

app = Flask(__name__)
CORS(app)

@app.errorhandler(Exception)
def handle_exception(e):
    # If it's a 404, let Flask handle it normally or return 404
    if isinstance(e, HTTPException) and e.code == 404:
        return jsonify({'error': 'Not Found'}), 404
        
    # Log the error with traceback
    error_msg = str(e)
    tb = traceback.format_exc()
    print(f"ERROR: {error_msg}")
    print(tb)
    app.logger.error(f"An error occurred: {error_msg}\n{tb}")
    
    # return json error
    return jsonify({
        'success': False,
        'error': f"Internal Server Error: {error_msg}",
        'traceback': tb if app.debug else None
    }), 500

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'm4a', 'flac', 'pdf', 'jpg', 'jpeg', 'png', 'bmp'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize converter
converter = MultiFormatConverter()


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    """Serve the main web interface"""
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload_file():
    """
    Handle file uploads (MP3, PDF, JPG)
    Returns JSON with extracted content
    """
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Check if filename is empty
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check if file type is allowed
        if not allowed_file(file.filename):
            return jsonify({'error': f'File type not supported. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'}), 400
        
        # Save file securely
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Convert to JSON and save to output.json automatically
            result = converter.convert_to_json(filepath, output_path='output.json')
            
            # Clean up uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
            
            return jsonify({
                'success': True,
                'data': result
            })
        
        except Exception as e:
            # Clean up on error
            if os.path.exists(filepath):
                os.remove(filepath)
            raise e
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/live-voice', methods=['POST'])
def live_voice():
    """
    Handle live voice recording
    Expects audio data as base64 encoded from browser
    """
    temp_webm_path = None
    temp_wav_path = None
    try:
        
        data = request.get_json()
        
        if not data or 'audio' not in data:
            return jsonify({'error': 'No audio data provided'}), 400
        
        # Decode base64 audio
        audio_data = data['audio']
        
        # Remove data URL prefix if present (e.g., "data:audio/webm;base64,")
        if ',' in audio_data:
            audio_data = audio_data.split(',')[1]
        
        audio_bytes = base64.b64decode(audio_data)
        
        # Save raw browser audio to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_webm:
            temp_webm.write(audio_bytes)
            temp_webm_path = temp_webm.name
        
        # Create temp WAV file path
        temp_wav_path = temp_webm_path.replace('.webm', '_converted.wav')
        
        try:
            # Convert browser audio to WAV format
            # Let pydub detect the format automatically instead of forcing webm
            audio = AudioSegment.from_file(temp_webm_path)
            
            # Export as proper WAV format (PCM, 16-bit, mono for best compatibility)
            audio = audio.set_frame_rate(16000).set_channels(1)
            audio.export(temp_wav_path, format='wav', parameters=['-acodec', 'pcm_s16le'])
            
            # Process the converted audio using the centralized converter
            # Don't save yet, we need to update content_type
            result = converter.convert_to_json(temp_wav_path, output_path=None)
            
            # Override content type for clarity
            result['content_type'] = 'live_voice'
            
            # Update output.json using the append helper
            converter._save_json(result, 'output.json')
            
            # Clean up temp files (with retry for Windows file locking)
            import time
            for attempt in range(3):
                try:
                    if os.path.exists(temp_webm_path):
                        os.remove(temp_webm_path)
                    if os.path.exists(temp_wav_path):
                        os.remove(temp_wav_path)
                    break
                except PermissionError:
                    if attempt < 2:
                        time.sleep(0.1)  # Wait a bit for file handles to release
            
            return jsonify({
                'success': True,
                'data': result
            })
        
        except Exception as e:
            # Clean up on error (safe cleanup)
            import time
            for attempt in range(2):
                try:
                    if os.path.exists(temp_webm_path):
                        os.remove(temp_webm_path)
                    if os.path.exists(temp_wav_path):
                        os.remove(temp_wav_path)
                    break
                except (PermissionError, FileNotFoundError):
                    if attempt < 1:
                        time.sleep(0.1)
            
            # Return more detailed error
            error_msg = str(e)
            if "[WinError 2]" in error_msg:
                error_msg = ("Audio processing failed: FFmpeg is not installed or not in PATH. "
                           "Please ensure FFmpeg is installed to process audio files.")
            
            return jsonify({
                'success': False,
                'error': error_msg
            }), 500
    
    except Exception as e:
        error_msg = str(e)
        if "[WinError 2]" in error_msg:
            error_msg = ("Audio processing failed: FFmpeg is not installed or not in PATH. "
                       "Please ensure FFmpeg is installed to process audio files.")
        return jsonify({
            'success': False,
            'error': error_msg
        }), 500


@app.route('/text-input', methods=['POST'])
def text_input():
    """
    Handle direct text input
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        
        # Process the text and save to output.json
        result = converter.process_text(text, output_path='output.json')
        
        return jsonify({
            'success': True,
            'data': result
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500



@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'supported_formats': converter.supported_formats
    })


if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Multi-Format to JSON Converter - Web Server")
    print("=" * 60)
    print("📡 Server starting at: http://localhost:8000")
    print("\n✨ Supported Formats:")
    print("   • Audio: MP3, WAV, M4A, FLAC")
    print("   • Documents: PDF")
    print("   • Images: JPG, JPEG, PNG, BMP")
    print("   • Live Voice Recording")
    print("\n" + "=" * 60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=8000)
