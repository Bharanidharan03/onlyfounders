import { useState, useEffect, useCallback, useRef } from 'react';

const useSpeechRecognition = (options = {}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState(null);

    const recognitionRef = useRef(null);

    useEffect(() => {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError('Speech Recognition API is not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = options.continuous ?? true;
        recognition.interimResults = options.interimResults ?? true;
        recognition.lang = options.lang || 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event) => {
            let finalTrans = '';
            let interimTrans = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTrans += event.results[i][0].transcript;
                } else {
                    interimTrans += event.results[i][0].transcript;
                }
            }

            setTranscript((prev) => prev + finalTrans);
            setInterimTranscript(interimTrans);
        };

        recognition.onerror = (event) => {
            // Gracefully handle 'no-speech' error
            if (event.error === 'no-speech') {
                console.warn('Speech recognition: no-speech detected (ignoring).');
                return; // Don't stop or set hard error
            }

            console.error('Speech Recognition Error:', event.error);
            setError(event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [options.continuous, options.interimResults, options.lang]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
                setError(null);
            } catch (err) {
                console.error("Error starting recognition:", err);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    return {
        isListening,
        transcript: transcript + interimTranscript, // Combine final + interim for real-time feel
        finalTranscript: transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
        error,
        isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    };
};

export default useSpeechRecognition;
