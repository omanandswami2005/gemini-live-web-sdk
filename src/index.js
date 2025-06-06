// Import dependencies (assumed to be bundled)
import EventEmitter from 'eventemitter3';
import GeminiLiveAPI from './gemini-live-api.js';
import { AudioRecorder } from './all_audio_processing/outgoing_audio_processing/audio-recorder.js';
import { AudioStreamer } from './all_audio_processing/incoming_audio_processing/audio-streamer.js';
import { MediaHandler } from './media-handler.js';
import { VolumeMeter } from './volume-meter.js';
import { base64ToArrayBuffer } from './utils.js';


export class GeminiLiveWebSDK {
    constructor(endpoint, token = null, options = {}) {
        this.endpoint = endpoint;
        this.token = token;
        this.options = {
            sampleRate: options.sampleRate || 24000,
            ...options
        };

        // Internal state
        this.audioContext = null;
        this.isRecording = false;
        this.isMuted = false;
        this.initialized = false;

        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 3;

        // Component instances
        this.geminiAPI = new GeminiLiveAPI(endpoint, token);
        this.audioRecorder = null;
        this.audioStreamer = null;
        this.mediaHandler = null;
        this.userVolumeMeter = null;
        this.streamVolumeMeter = null;

        // Event emitter for user callbacks
        this.events = new EventEmitter();

        // Bind methods
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);

        // Setup event handlers
        this.setupEventHandlers();
    }

    // Lazily initialize audio context when needed
    async ensureAudioInitialized() {
        if (!this.initialized) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                    sampleRate: this.options.sampleRate
                });
                if (this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }
                this.audioStreamer = new AudioStreamer(this.audioContext);
                this.initialized = true;
                return true;
            } catch (error) {
                this.events.emit('error', new Error(`Audio initialization failed: ${error.message}`));
                return false;
            }
        }
        return true;
    }

    // Setup Gemini API event handlers
    setupEventHandlers() {
        this.geminiAPI.onSetupComplete = () => {
            this.connectionAttempts = 0; // Reset attempts on success
            this.events.emit('setupComplete');
        };

        this.geminiAPI.onAudioData = async (audioData) => {
            await this.ensureAudioInitialized();
            const arrayBuffer = base64ToArrayBuffer(audioData);
            const uint8Array = new Uint8Array(arrayBuffer);
            this.audioStreamer.addPCM16(uint8Array);
            this.audioStreamer.resume();
            this.events.emit('audioReceived', audioData);
        };

        this.geminiAPI.onToolCall = (toolCall) => {
            this.events.emit('toolCall', toolCall);
        };

        this.geminiAPI.onInterrupted = () => {
            this.audioStreamer?.stop();
            this.events.emit('interrupted');
        };

        this.geminiAPI.onTurnComplete = () => {
            this.audioStreamer?.complete();
            this.events.emit('turnComplete');
        };

        this.geminiAPI.onError = (error) => {
            this.connectionAttempts++;
            if (this.connectionAttempts >= this.maxConnectionAttempts) {
                this.events.emit('error', new Error(`${error.message} (Max attempts reached)`));
            } else {
                this.events.emit('error', error);
            }
        };


        this.geminiAPI.onClose = (event) => {
            this.events.emit('close', event);
        };
        this.geminiAPI.onTranscriptionUpdate = (transcriptionText) => {
            this.events.emit('transcriptionUpdate', transcriptionText);
        };
    }

    // Set video element for webcam/screen sharing
    setVideoElement(videoElement) {
        if (!(videoElement instanceof HTMLVideoElement)) {
            throw new Error('Video element must be an HTMLVideoElement');
        }
        this.mediaHandler = new MediaHandler();
        this.mediaHandler.initialize(videoElement);
    }

    // Create volume meters for visualization
    createUserVolumeMeter(progressElement) {
        if (!this.audioRecorder || !this.audioRecorder.audioContext) {
            throw new Error('Start recording before attaching a user volume meter');
        }
        this.userVolumeMeter = new VolumeMeter(this.audioRecorder.audioContext, progressElement);
        this.userVolumeMeter.attachToSource(this.audioRecorder.source);

    }

    createStreamVolumeMeter(progressElement) {
        if (!this.audioStreamer || !this.audioStreamer.gainNode) {
            throw new Error('Audio streamer not initialized');
        }
        this.streamVolumeMeter = new VolumeMeter(this.audioContext, progressElement);
        this.streamVolumeMeter.attachToSource(this.audioStreamer.gainNode);
    }

    // Start audio recording
    async startRecording() {
        if (this.isRecording) return;
        if (!(await this.ensureAudioInitialized())) {
            throw new Error('Failed to initialize audio context');
        }

        this.audioRecorder = new AudioRecorder();
        await this.audioRecorder.start();

        this.audioRecorder.on('data', (base64Data) => {
            this.geminiAPI.sendAudioChunk(base64Data);
        });

        this.isRecording = true;
        this.events.emit('recordingStarted');
    }

    // Stop audio recording
    stopRecording() {
        if (!this.isRecording || !this.audioRecorder) return;

        this.audioRecorder.stop();
        this.audioRecorder.off('data');
        if (this.userVolumeMeter) {
            this.userVolumeMeter.disconnect();
            this.userVolumeMeter = null;
        }
        this.isRecording = false;
        this.isMuted = false;
        this.geminiAPI.sendEndMessage();
        this.events.emit('recordingStopped');

        if (this.mediaHandler) {
            this.mediaHandler.stopAll();
        }
    }

    // Toggle webcam
    async toggleWebcam() {
        if (!this.mediaHandler) {
            throw new Error('Set a video element before using webcam');
        }
        if (this.mediaHandler.isWebcamActive) {
            this.mediaHandler.stopAll();
        } else {
            const success = await this.mediaHandler.startWebcam();
            if (success) {
                this.mediaHandler.startFrameCapture((base64Image) => {
                    if (this.geminiAPI.socket.connected) {
                        this.geminiAPI.sendFrame(base64Image);
                    }
                });
            }
        }
    }

    // Toggle screen sharing
    async toggleScreen() {
        if (!this.mediaHandler) {
            throw new Error('Set a video element before using screen sharing');
        }
        if (this.mediaHandler.isScreenActive) {
            this.mediaHandler.stopAll();
        } else {
            const success = await this.mediaHandler.startScreenShare();
            if (success) {
                this.mediaHandler.startFrameCapture((base64Image) => {
                    if (this.geminiAPI.socket.connected) {
                        this.geminiAPI.sendFrame(base64Image);
                    }
                });
            }
        }
    }

    // Switch camera
    async switchCamera() {
        if (!this.mediaHandler || !this.mediaHandler.isWebcamActive) {
            throw new Error('Webcam must be active to switch cameras');
        }
        await this.mediaHandler.switchCamera();
    }

    // Toggle mute
    toggleMute() {
        if (!this.audioRecorder || !this.isRecording) return;
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.audioRecorder.mute();
        } else {
            this.audioRecorder.unmute();
        }
        this.events.emit('muteToggled', this.isMuted);
    }

    // Send tool response
    sendToolResponse(functionResponses) {
        this.geminiAPI.sendToolResponse(functionResponses);
    }
    sendTextMessage(text) {
        this.geminiAPI.sendTextMessage(text);
    }
    // Event subscription
    on(event, callback) {
        this.events.on(event, callback);
    }

    off(event, callback) {
        this.events.off(event, callback);
    }

    // Cleanup resources
    destroy() {
        this.stopRecording();
        if (this.mediaHandler) this.mediaHandler.stopAll();
        if (this.audioContext) this.audioContext.close();
        if (this.geminiAPI.socket.connected) this.geminiAPI.socket.disconnect();
        this.events.removeAllListeners();
    }

    // State getters
    get isConnected() {
        return this.geminiAPI.socket.connected;
    }
}