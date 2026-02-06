import React from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

const VoiceDebug = () => {
    const {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        error,
        isSupported
    } = useSpeechRecognition({ continuous: true, lang: 'en-US' });

    if (!isSupported) {
        return <div className="p-4 text-red-500 bg-red-100 rounded">Browser not supported.</div>;
    }

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">🎙️ Voice Debugger</h2>

            {/* Status Badge */}
            <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isListening ? 'bg-green-100 text-green-800 animate-pulse' : 'bg-gray-100 text-gray-800'}`}>
                    {isListening ? 'Listening...' : 'Idle'}
                </span>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 text-sm text-red-700 bg-red-100 rounded border border-red-200">
                    Error: {error}
                </div>
            )}

            {/* Transcript Area */}
            <div className="p-4 h-48 overflow-y-auto bg-gray-50 rounded border border-gray-200 text-gray-700 font-mono text-sm leading-relaxed">
                {transcript || <span className="text-gray-400 italic">Say something...</span>}
            </div>

            {/* Controls */}
            <div className="flex space-x-3 pt-2">
                <button
                    onClick={startListening}
                    disabled={isListening}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${isListening
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    Start
                </button>

                <button
                    onClick={stopListening}
                    disabled={!isListening}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${!isListening
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                >
                    Stop
                </button>

                <button
                    onClick={resetTranscript}
                    className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors ml-auto"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default VoiceDebug;
