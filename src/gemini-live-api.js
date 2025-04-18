
import { io } from "socket.io-client";

export default class GeminiLiveAPI {
  /**
   * Constructor for GeminiLiveAPI
   * @param {string} endpoint - the Socket.IO server endpoint URL
   */
  constructor(endpoint, token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.f9gSOnolW0uUbQsD3G7XCEHxxSqn29Ao3b1V_k5jscA") {
    // Socket.IO connection setup
    try {
      this.socket = io(endpoint, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      });
    } catch (error) {
      console.error("Error connecting to Socket.IO server:", error.message);
      throw new Error("Socket.IO connection failed: " + error.message);
    }

    // Event handlers
    this.onSetupComplete = () => { };
    this.onAudioData = () => { };
    this.onInterrupted = () => { };
    this.onTurnComplete = () => { };
    this.onError = () => { };
    this.onClose = () => { };
    this.onToolCall = () => { };
    this.onTextData = () => { };
    this.onTranscriptionUpdate = () => { }; // Added for real-time transcription updates


    this.pendingMessages = [];
    this.isConnected = false;
    this.transcriptionBuffer = ""; // Buffer for transcription fragments
    this.isTurnComplete = false; // Flag to track turn completion

    // Setup Socket.IO event handlers
    this.setupEventHandlers();
  }

  /**
   * Sets up Socket.IO event handlers
   */
  setupEventHandlers() {
    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log("Connected to server");
    });

    this.socket.on("message", async (message) => {
      try {

        console.log('Received message:', message);

        // Handle different types of responses
        if (message.setupComplete) {
          this.onSetupComplete();
        } else if (message.toolCall) {
          console.log('Tool call:', message.toolCall);
          this.onToolCall(message.toolCall);
        } else if (message.serverContent) {
          // Handle server content responses
          // console.log('Server content:', message.serverContent);
          if (message.serverContent.interrupted) {
            this.onInterrupted();
            return;
          }

          // Handle audio data
          if (message.serverContent.modelTurn?.parts?.[0]?.inlineData) {
            const audioData = message.serverContent.modelTurn.parts[0].inlineData.data;
            this.onAudioData(audioData);

            // Send continue signal if not at the end of the turn
            if (!message.serverContent.turnComplete) {
              this.sendContinueSignal();
            }
          }
          
          // Handle Text data
          if (message.serverContent.modelTurn?.parts[0]?.text) {
            const textData = message.serverContent.modelTurn.parts[0]?.text;
            console.log('Text data:', textData);
            // statusbar.innerHTML = textData;
            this.onTextData(textData);

            // Send continue signal if not at the end of the turn
            if (!message.serverContent.turnComplete) {
              this.sendContinueSignal();
            }
          }

          // Handle turn completion
          if (message.serverContent.turnComplete) {
            this.isTurnComplete = true;
            this.onTurnComplete();
          }
        }
      } catch (error) {
        console.error('Error parsing response:', error);
        this.onError('Error parsing response: ' + error.message);
      }
    });

    this.socket.on("transcription", (message) => {
      // console.log("Transcription message:", message.text);
      if (message.text) {
        this.transcriptionBuffer += message.text;
        this.onTranscriptionUpdate(this.transcriptionBuffer);
      }
    });


    // Handle connection errors
    this.socket.on('connect_error', (error) => {
      const errorMessage = `WebSocket connection failed (Please check your server): ${error.message}`;
      if (this.onError) this.onError(new Error(errorMessage));
    });

    this.socket.on('connect_timeout', () => {
      const errorMessage = 'WebSocket connection timed out';
      if (this.onError) this.onError(new Error(errorMessage));
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
      this.onError(error);
    });

    this.socket.on("disconnect", (reason) => {
      this.isConnected = false;
      console.log("Disconnected:", reason);
      this.onClose({ code: 1000, reason });
    });

  }
  sendOrQueue(type, data) {
    this.socket.emit(type, data);
  }



  /**
   * Sends an audio chunk to the server
   * @param {string} base64Audio - base64 encoded audio data
   */
  sendAudioChunk(base64Audio) {
    this.sendOrQueue("message", {
      realtime_input: {
        media_chunks: [{
          mime_type: "audio/pcm",
          data: base64Audio
        }]
      }
    });
  }

  /**
   * Sends an end message to the server
   */
  sendEndMessage() {
    this.sendOrQueue("message", {
      client_content: {
        turns: [{ role: "user", parts: [] }],
        turn_complete: true
      }
    });
  }
  sendTextMessage(text) {
    this.sendOrQueue("message", {
      client_content: {
        turns: [{ role: "user", parts: [{ text: text }] }],
        turn_complete: true
      }
    });
  }

  /**
   * Sends a continue signal to the server
   */
  sendContinueSignal() {
    this.sendOrQueue("message", {
      client_content: {
        turns: [{ role: "user", parts: [] }],
        turn_complete: false
      }
    });
  }

  /**
   * Sends a tool response to the server
   * @param {Object} functionResponses - tool response data
   */
  sendToolResponse(functionResponses) {
    this.sendOrQueue("message", {
      tool_response: {
        function_responses: functionResponses
      }
    });
  }


  /**
   * Ensures the connection is active
   * @param {number} timeout - timeout in milliseconds
   */
  async ensureConnected(timeout = 5000) {
    if (this.isConnected) return true;

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Connection timeout"));
      }, timeout);

      const checkConnection = () => {
        if (this.isConnected) {
          clearTimeout(timeoutId);
          resolve(true);
        }
      };

      this.socket.once("connect", checkConnection);
      this.socket.once("connect_error", reject);
    });
  }
  sendFrame(base64Image) {
    this.sendOrQueue("message", {
      realtime_input: {
        media_chunks: [{
          mime_type: "image/jpeg",
          data: base64Image
        }]
      }
    });
  }

  get connectionStatus() {
    return this.socket.connected ? "connected" : "disconnected";
  }
}