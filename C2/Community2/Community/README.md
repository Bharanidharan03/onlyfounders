# 🚀 Multi-Format to JSON Converter

A web application that converts multiple input formats (MP3, PDF, JPG, live voice) into structured JSON data.

## ✨ Features

- **Audio to Text**: Convert MP3, WAV, M4A, FLAC files to JSON using speech recognition
- **PDF Extraction**: Extract text from PDF documents with page-by-page parsing
- **Image OCR**: Extract text from images (JPG, PNG, BMP) using Tesseract OCR
- **Live Voice Recording**: Record and transcribe live voice input directly from your browser
- **Direct Text Input**: Manually enter text for structure extraction
- **Automatic JSON Saving**: All processed results are automatically saved to `output.json`
- **Beautiful Web Interface**: Modern, responsive UI with drag-and-drop file uploads
- **JSON Output**: Structured JSON output with metadata and processing information
- **Export Options**: Copy to clipboard or download as JSON file

## 📋 Prerequisites

Before running the application, you need to install:

1. **Python 3.7+**
2. **Tesseract OCR** (for image processing)
   - Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
   - Add Tesseract to your system PATH

## 🔧 Installation

1. **Install Python dependencies**:
   ```bash
   python -m pip install -r requirements.txt
   ```
   
   > **Note for Windows users:** If `pip` command doesn't work, use `python -m pip` instead.

## 🎯 Usage

### Running the Web Application

**`app.py` is the MAIN PROGRAM** - this starts the web server:

```bash
python app.py
```

The server will start at `http://localhost:5000`

### Using the Web Interface

1. Open your browser and navigate to `http://localhost:5000`
2. Choose your input method:
   - **Upload File**: Drag & drop or click to browse for MP3, PDF, or JPG files
   - **Live Voice**: Click "Start Recording" and speak into your microphone
3. View the JSON output displayed on the page
4. Copy to clipboard or download the JSON file

### Using the Command-Line Tool

You can also use the standalone converter without the web interface:

```bash
python multi_format_to_json.py
```

## 📁 Project Structure

```
only_founder_1/
├── app.py                          # 🎯 MAIN PROGRAM - Flask web server
├── multi_format_to_json.py         # Core converter library
├── requirements.txt                # Python dependencies
├── templates/
│   └── index.html                  # Web interface HTML
├── static/
│   ├── css/
│   │   └── style.css              # Styling
│   └── js/
│       └── app.js                 # Frontend JavaScript
└── uploads/                        # Temporary upload folder (auto-created)
```

## 🔑 Key Components

### Main Program: `app.py`
- Flask web server with REST API endpoints
- `/` - Serves the web interface
- `/upload` - Handles file uploads (POST)
- `/live-voice` - Handles voice recordings (POST)
- `/health` - Health check endpoint (GET)

### Core Library: `multi_format_to_json.py`
- `MultiFormatConverter` class with conversion methods
- Supports audio, PDF, and image processing
- Can be used standalone or imported

## 📝 API Endpoints

### POST `/upload`
Upload a file for conversion

**Request**: `multipart/form-data` with file
**Response**: 
```json
{
  "success": true,
  "data": {
    "content_type": "audio_transcription",
    "text": "Transcribed text here...",
    "metadata": { ... }
  }
}
```

### POST `/live-voice`
Submit live voice recording

**Request**: 
```json
{
  "audio": "base64_encoded_wav_data"
}
```

**Response**: Same as `/upload`

## 🎨 Supported Formats

| Format Type | Extensions | Processing Method |
|-------------|-----------|-------------------|
| Audio | .mp3, .wav, .m4a, .flac | Google Speech Recognition |
| Documents | .pdf | PyPDF2 text extraction |
| Images | .jpg, .jpeg, .png, .bmp | Tesseract OCR |
| Live Voice | Browser recording | Web Audio API → Speech Recognition |

## 🛠️ Troubleshooting

**Issue**: Module not found errors
- **Solution**: Install all dependencies: `pip install -r requirements.txt`

**Issue**: Tesseract not found
- **Solution**: Install Tesseract OCR and add to system PATH

**Issue**: Microphone access denied
- **Solution**: Allow microphone permissions in your browser

**Issue**: Port 5000 already in use
- **Solution**: Change the port in `app.py` (line: `app.run(... port=5000)`)

## 📦 Dependencies

- **flask** - Web framework
- **flask-cors** - Cross-origin resource sharing
- **speechrecognition** - Audio to text conversion
- **pydub** - Audio file processing
- **pillow** - Image processing
- **PyPDF2** - PDF text extraction
- **pytesseract** - OCR engine wrapper

## 🚀 Quick Start

```bash
# 1. Install dependencies (use "python -m pip" on Windows if "pip" doesn't work)
python -m pip install -r requirements.txt

# 2. Run the web server (MAIN PROGRAM)
python app.py

# 3. Open browser
# Navigate to http://localhost:5000

# 4. Upload a file or record your voice
# 5. View the JSON output!
```

## 📄 License

Open source - feel free to use and modify!
