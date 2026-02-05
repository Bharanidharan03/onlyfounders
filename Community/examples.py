"""
Example usage of the Multi-Format to JSON Converter
"""

from multi_format_to_json import MultiFormatConverter
import json

def example_audio_conversion():
    """Example: Convert MP3 audio to JSON"""
    print("\n" + "="*60)
    print("EXAMPLE 1: Audio File to JSON")
    print("="*60)
    
    converter = MultiFormatConverter()
    
    # Convert audio file
    result = converter.convert_to_json(
        input_path='sample_audio.mp3',
        output_path='audio_output.json'
    )
    
    print("Transcribed text:", result.get('text'))
    print("Word count:", result.get('word_count'))


def example_pdf_conversion():
    """Example: Convert PDF to JSON"""
    print("\n" + "="*60)
    print("EXAMPLE 2: PDF Document to JSON")
    print("="*60)
    
    converter = MultiFormatConverter()
    
    # Convert PDF
    result = converter.convert_to_json(
        input_path='sample_document.pdf',
        output_path='pdf_output.json'
    )
    
    print(f"Number of pages: {result.get('num_pages')}")
    print(f"Total words: {result.get('word_count')}")
    print(f"First 100 characters: {result.get('full_text', '')[:100]}...")


def example_image_conversion():
    """Example: Convert image (JPG) to JSON using OCR"""
    print("\n" + "="*60)
    print("EXAMPLE 3: Image to JSON (OCR)")
    print("="*60)
    
    converter = MultiFormatConverter()
    
    # Convert image
    result = converter.convert_to_json(
        input_path='sample_image.jpg',
        output_path='image_output.json'
    )
    
    print("Extracted text:", result.get('text'))
    print("Image size:", result.get('image_properties', {}).get('width'), 
          "x", result.get('image_properties', {}).get('height'))


def example_live_voice():
    """Example: Record live voice and convert to JSON"""
    print("\n" + "="*60)
    print("EXAMPLE 4: Live Voice Recording to JSON")
    print("="*60)
    
    converter = MultiFormatConverter()
    
    # Record for 5 seconds
    result = converter.live_voice_to_json(
        duration=5,
        output_path='voice_output.json'
    )
    
    print("Transcribed:", result.get('text'))


def example_custom_json_structure():
    """Example: Create custom JSON structure from converted data"""
    print("\n" + "="*60)
    print("EXAMPLE 5: Custom JSON Structure")
    print("="*60)
    
    converter = MultiFormatConverter()
    
    # Convert any file
    result = converter.convert_to_json('sample_audio.mp3')
    
    # Create your own JSON structure
    custom_data = {
        "id": "record_001",
        "type": "transcription",
        "content": {
            "text": result.get('text', ''),
            "metadata": {
                "source": result.get('metadata', {}).get('source_file'),
                "word_count": result.get('word_count', 0),
                "processing_engine": result.get('processing_method')
            }
        },
        "status": "completed"
    }
    
    # Save custom structure
    with open('custom_structure.json', 'w', encoding='utf-8') as f:
        json.dump(custom_data, f, indent=2, ensure_ascii=False)
    
    print("Custom JSON created!")
    print(json.dumps(custom_data, indent=2))


def example_error_handling():
    """Example: Proper error handling"""
    print("\n" + "="*60)
    print("EXAMPLE 6: Error Handling")
    print("="*60)
    
    converter = MultiFormatConverter()
    
    try:
        result = converter.convert_to_json('nonexistent_file.mp3')
        print("Success:", result)
    except FileNotFoundError:
        print("Error: File not found")
    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("MULTI-FORMAT TO JSON CONVERTER - EXAMPLES")
    print("="*60)
    
    print("\nNote: Make sure you have sample files available:")
    print("- sample_audio.mp3 (audio file)")
    print("- sample_document.pdf (PDF document)")
    print("- sample_image.jpg (image with text)")
    print("\nOr modify the file paths in the examples above.")
    
    # Uncomment the examples you want to run:
    
    # example_audio_conversion()
    # example_pdf_conversion()
    # example_image_conversion()
    # example_live_voice()
    # example_custom_json_structure()
    example_error_handling()
