// Multi-Format to JSON Converter - Frontend JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const uploadStatus = document.getElementById('uploadStatus');
    const voiceStatus = document.getElementById('voiceStatus');
    const recordBtn = document.getElementById('recordBtn');
    const voiceVisualizer = document.getElementById('voiceVisualizer');
    const outputSection = document.getElementById('outputSection');
    const jsonOutput = document.getElementById('jsonOutput');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Text Input Elements
    const textInput = document.getElementById('textInput');
    const submitTextBtn = document.getElementById('submitTextBtn');
    const textStatus = document.getElementById('textStatus');

    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;

            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabName}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });

    // File Upload - Click to browse
    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });

    // File Upload - File selected
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadFile(file);
        }
    });

    // File Upload - Drag and Drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');

        const file = e.dataTransfer.files[0];
        if (file) {
            uploadFile(file);
        }
    });

    // Upload File Function
    async function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        showLoading(true);
        showStatus(uploadStatus, `Uploading ${file.name}...`, 'success');

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                displayJSON(result.data);
                showStatus(uploadStatus, '✅ File processed successfully!', 'success');
            } else {
                showStatus(uploadStatus, `❌ Error: ${result.error}`, 'error');
            }
        } catch (error) {
            showStatus(uploadStatus, `❌ Error: ${error.message}`, 'error');
        } finally {
            showLoading(false);
            fileInput.value = ''; // Reset input
        }
    }

    // Voice Recording - Using Web Speech API for simplicity and reliability
    let recognition;
    let isRecording = false;
    let silenceTimer;
    let finalTranscript = '';
    const SILENCE_DURATION = 4000; // 4 seconds of silence to stop

    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showStatus(voiceStatus, '❌ Your browser does not support voice recognition. Please use Chrome.', 'error');
        recordBtn.disabled = true;
    }

    recordBtn.addEventListener('click', () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    });

    function startRecording() {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        finalTranscript = '';
        isRecording = true;
        speechDetected = false;

        recognition.onstart = () => {
            recordBtn.classList.add('recording');
            recordBtn.querySelector('.btn-text').textContent = 'Stop Recording';
            voiceVisualizer.classList.add('recording');
            showStatus(voiceStatus, '🎤 Listening... Speak now!', 'success');

            // Start a safety timeout: if no speech at all after 10s, stop.
            if (silenceTimer) clearTimeout(silenceTimer);
            silenceTimer = setTimeout(() => {
                if (!speechDetected) {
                    console.log("No speech detected after 10s, stopping...");
                    stopRecording();
                }
            }, 10000);
        };

        recognition.onresult = (event) => {
            speechDetected = true;
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            // Visualizer feedback
            const activity = interimTranscript.length > 0 ? 1.2 : 1.0;
            voiceVisualizer.style.transform = `scale(${activity})`;

            // Reset silence timer whenever speech is detected
            if (silenceTimer) clearTimeout(silenceTimer);
            silenceTimer = setTimeout(() => {
                console.log("4 seconds of silence detected after speech, stopping...");
                stopRecording();
            }, SILENCE_DURATION);
        };

        recognition.onerror = (event) => {
            // Ignore no-speech and service-not-allowed if we want to keep going
            if (event.error === 'no-speech') {
                console.warn('Speech recognition: no-speech detected.');
                // Don't treat as a hard error unless we want to stop
                return;
            }

            console.error('Speech recognition error:', event.error);
            showStatus(voiceStatus, `❌ Error: ${event.error}. Please try again.`, 'error');
            stopRecording();
        };

        recognition.onend = () => {
            // If the browser ends it automatically (due to no-speech or other issues)
            // but we still think we are recording, just stop it properly.
            if (isRecording) {
                console.log("Recognition ended naturally, finalizing...");
                stopRecording();
            }
        };

        try {
            recognition.start();
        } catch (e) {
            console.error('Recognition start error:', e);
            showStatus(voiceStatus, `❌ Error starting recognition: ${e.message}`, 'error');
            isRecording = false;
        }
    }

    function stopRecording() {
        if (isRecording) {
            isRecording = false;
            if (recognition) {
                recognition.stop();
            }
            if (silenceTimer) {
                clearTimeout(silenceTimer);
                silenceTimer = null;
            }

            // Update UI
            recordBtn.classList.remove('recording');
            recordBtn.querySelector('.btn-text').textContent = 'Start Recording';
            voiceVisualizer.classList.remove('recording');
            voiceVisualizer.style.transform = `scale(1)`;

            if (finalTranscript.trim()) {
                showStatus(voiceStatus, '⏸️ Processing transcript...', 'success');
                processTranscript(finalTranscript);
            } else {
                showStatus(voiceStatus, '⚠️ No speech detected.', 'error');
            }
        }
    }

    async function processTranscript(text) {
        showLoading(true);

        try {
            const response = await fetch('/text-input', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: text })
            });

            const result = await response.json();

            if (result.success) {
                // Ensure structured JSON has content_type=live_voice for consistency
                if (result.data) {
                    result.data.content_type = 'live_voice';
                }
                displayJSON(result.data);
                showStatus(voiceStatus, '✅ Voice transcribed successfully!', 'success');
            } else {
                showStatus(voiceStatus, `❌ Error: ${result.error}`, 'error');
            }
        } catch (error) {
            showStatus(voiceStatus, `❌ Error: ${error.message}`, 'error');
        } finally {
            showLoading(false);
        }
    }

    // Text Input Submission
    submitTextBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text) {
            showStatus(textStatus, '⚠️ Please enter some text first', 'error');
            return;
        }

        await processTextInput(text);
    });

    async function processTextInput(text) {
        showLoading(true);
        showStatus(textStatus, '🔄 Converting text to JSON...', 'success');

        try {
            const response = await fetch('/text-input', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: text })
            });

            const result = await response.json();

            if (result.success) {
                displayJSON(result.data);
                showStatus(textStatus, '✅ Text processed successfully!', 'success');
            } else {
                showStatus(textStatus, `❌ Error: ${result.error}`, 'error');
            }
        } catch (error) {
            showStatus(textStatus, `❌ Error: ${error.message}`, 'error');
        } finally {
            showLoading(false);
        }
    }

    // Display JSON Output
    function displayJSON(data) {
        const formattedJSON = JSON.stringify(data, null, 2);
        jsonOutput.textContent = formattedJSON;

        // Show output section with animation
        outputSection.style.display = 'block';
        setTimeout(() => {
            outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);

        // Store for download
        outputSection.dataset.jsonData = formattedJSON;
    }

    // Copy to Clipboard
    copyBtn.addEventListener('click', async () => {
        const jsonText = jsonOutput.textContent;

        try {
            await navigator.clipboard.writeText(jsonText);

            // Visual feedback
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        } catch (error) {
            alert('Failed to copy to clipboard');
        }
    });

    // Download JSON
    downloadBtn.addEventListener('click', () => {
        const jsonText = jsonOutput.textContent;
        const blob = new Blob([jsonText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `output_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Visual feedback
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = '✅ Downloaded!';
        setTimeout(() => {
            downloadBtn.textContent = originalText;
        }, 2000);
    });

    // Utility Functions
    function showStatus(element, message, type) {
        element.textContent = message;
        element.className = `status-message show ${type}`;

        // Auto-hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                element.classList.remove('show');
            }, 5000);
        }
    }

    function showLoading(show) {
        if (show) {
            loadingOverlay.classList.add('show');
        } else {
            loadingOverlay.classList.remove('show');
        }
    }
});
