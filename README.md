
# Gemini Live Web SDK

The `gemini-live-web-sdk` is a JavaScript library for integrating real-time audio and video streaming with the Gemini Live API. It provides features like audio recording, webcam and screen sharing, volume visualization, and tool call handling, making it ideal for building interactive web applications with voice and video capabilities.

## Features

* **Audio Recording** : Capture and send audio to the Gemini Live API with real-time processing.
* **Webcam and Screen Sharing** : Stream video from a webcam or screen share to the server.
* **Volume Meters** : Visualize user input and incoming audio levels with progress bars.
* **Tool Call Handling** : Respond to server-initiated tool calls (e.g., function calls like `get_weather`).
* **Event-Driven Architecture** : Subscribe to events like connection status, recording state, and errors.
* **Mute and Camera Switching** : Toggle microphone mute and switch between available cameras.
* **Clean Resource Management** : Properly clean up resources on session end or page unload.

## Installation

Install the package via npm:

```bash
npm install gemini-live-web-sdk
```

Alternatively, use the CDN for browser-based projects:

```html
<script src="https://cdn.jsdelivr.net/npm/gemini-live-web-sdk/dist/gemini-live-web-sdk.umd.js"></script>
```

## Module Formats

The package provides three module formats to suit different environments:

* **ESM (gemini-live-web-sdk.mjs)** : For modern JavaScript projects using ES Modules.
* **CommonJS (gemini-live-web-sdk.js)** : For Node.js or environments requiring CommonJS.
* **UMD (gemini-live-web-sdk.umd.js)** : For browser environments or projects needing universal compatibility.

### Adding the Package

#### ESM (Modern JavaScript)

Use `import` with `type="module"` in HTML or Node.js:

```html
<script type="module">
  import { GeminiLiveWebSDK } from 'https://cdn.jsdelivr.net/npm/gemini-live-web-sdk/dist/gemini-live-web-sdk.mjs';
  const sdk = new GeminiLiveWebSDK('http://localhost:8080', <Auth_Token>);
</script>
```

#### UMD (Browser)

Use a `<script>` tag for direct browser inclusion:

```html
<script src="https://cdn.jsdelivr.net/npm/gemini-live-web-sdk/dist/gemini-live-web-sdk.umd.js"></script>
<script>
  const sdk = new window.GeminiLiveWebSDK.GeminiLiveWebSDK('http://localhost:8080', <Auth_Token>);
</script>
```

 *Note* : Access the class as `window.GeminiLiveWebSDK.GeminiLiveWebSDK` due to named export behavior.

#### CommonJS (Node.js)

Require the package in Node.js:

```javascript
const { GeminiLiveWebSDK } = require('gemini-live-web-sdk');
const sdk = new GeminiLiveWebSDK('http://localhost:8080', <Auth_Token>);
```

 *Note* : ***CommonJS is primarily for Node.js and may not work directly in browsers without a bundler.***

## Usage

The SDK is designed for browser environments, interacting with a Gemini Live API server via WebSocket. Below is a full-fledged example demonstrating all features.

### Example: Interactive Audio/Video Application

This HTML example creates a web application with controls for audio recording, webcam, screen sharing, muting, and volume visualization.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gemini Live Web SDK Test</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    video {
      border: 1px solid #ccc;
      width: 320px;
      height: 240px;
      background: #000;
    }
    progress {
      width: 200px;
      display: block;
      margin: 10px 0;
    }
    button {
      margin: 5px;
      padding: 8px 16px;
      cursor: pointer;
    }
    button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    #status {
      margin: 10px 0;
      font-weight: bold;
    }
    #error {
      color: red;
      margin: 10px 0;
    }
    .control-group {
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <h1>Gemini Live Web SDK Test</h1>
  <div id="status">Disconnected</div>
  <div id="error"></div>

  <div class="control-group">
    <video id="videoPreview" autoplay playsinline></video>
    <div>
      <label>User Input Volume:</label>
      <progress id="volume-meter-user" max="100" value="0"></progress>
    </div>
    <div>
      <label>Incoming Voice Volume:</label>
      <progress id="volume-meter-stream" max="100" value="0"></progress>
    </div>
  </div>

  <div class="control-group">
    <button id="start" onclick="startRecording()" disabled>Start Recording</button>
    <button id="stop" onclick="stopRecording()" disabled>Stop Recording</button>
    <button id="mute" onclick="toggleMute()" disabled>Mute</button>
    <button id="webcam" onclick="toggleWebcam()">Toggle Webcam</button>
    <button id="screen" onclick="toggleScreen()">Toggle Screen Share</button>
    <button id="switch-camera" onclick="switchCamera()" disabled>Switch Camera</button>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/gemini-live-web-sdk/dist/gemini-live-web-sdk.umd.js"></script>

  <script>
    // DOM elements
    const statusDiv = document.getElementById('status');
    const errorDiv = document.getElementById('error');
    const startButton = document.getElementById('start');
    const stopButton = document.getElementById('stop');
    const muteButton = document.getElementById('mute');
    const webcamButton = document.getElementById('webcam');
    const screenButton = document.getElementById('screen');
    const switchCameraButton = document.getElementById('switch-camera');

    // Error display
    function showError(message) {
      errorDiv.textContent = message;
      setTimeout(() => {
        errorDiv.textContent = '';
      }, 5000);
    }

    // Initialize SDK
    let sdk;
    try {
      // Workaround for v1.0.2; remove if using default export
      const SDKClass = window.GeminiLiveWebSDK.GeminiLiveWebSDK;
      sdk = new SDKClass('http://localhost:8080', <Auth_Token>, {
        sampleRate: 24000
      });
    } catch (error) {
      showError(`SDK Initialization Failed: ${error.message}`);
      return;
    }

    // Set video element
    try {
      sdk.setVideoElement(document.getElementById('videoPreview'));
    } catch (error) {
      showError(`Video Element Setup Failed: ${error.message}`);
      return;
    }

    // Event handlers
    sdk.on('setupComplete', () => {
      statusDiv.textContent = 'Connected';
      startButton.disabled = false;
      webcamButton.disabled = false;
      screenButton.disabled = false;
      console.log('Connected to server');
    });

    sdk.on('recordingStarted', () => {
      statusDiv.textContent = 'Recording';
      startButton.disabled = true;
      stopButton.disabled = false;
      muteButton.disabled = false;
      switchCameraButton.disabled = !sdk.mediaHandler?.isWebcamActive;
      try {
        sdk.createUserVolumeMeter(document.getElementById('volume-meter-user'));
        sdk.createStreamVolumeMeter(document.getElementById('volume-meter-stream'));
      } catch (error) {
        showError(`Volume Meter Setup Failed: ${error.message}`);
      }
      console.log('Recording started');
    });

    sdk.on('recordingStopped', () => {
      statusDiv.textContent = 'Connected';
      startButton.disabled = false;
      stopButton.disabled = true;
      muteButton.disabled = true;
      switchCameraButton.disabled = true;
      muteButton.textContent = 'Mute';
      console.log('Recording stopped');
    });

    sdk.on('audioReceived', () => {
      console.log('Received audio from server');
    });

    sdk.on('toolCall', (toolCall) => {
      console.log('Tool call received:', toolCall);
      if (toolCall.function === 'get_weather') {
        sdk.sendToolResponse({
          function: 'get_weather',
          result: { temperature: 25, condition: 'sunny' }
        });
      }
    });

    sdk.on('muteToggled', (isMuted) => {
      muteButton.textContent = isMuted ? 'Unmute' : 'Mute';
      console.log(`Microphone ${isMuted ? 'muted' : 'unmuted'}`);
    });

    sdk.on('error', (error) => {
      showError(`SDK Error: ${error.message}`);
      console.error('SDK Error:', error);
    });

    sdk.on('close', () => {
      statusDiv.textContent = 'Disconnected';
      startButton.disabled = true;
      stopButton.disabled = true;
      muteButton.disabled = true;
      webcamButton.disabled = true;
      screenButton.disabled = true;
      switchCameraButton.disabled = true;
      console.log('Connection closed');
    });

    // Button handlers
    function startRecording() {
      try {
        sdk.startRecording();
      } catch (error) {
        showError(`Start Recording Failed: ${error.message}`);
      }
    }

    function stopRecording() {
      try {
        sdk.stopRecording();
      } catch (error) {
        showError(`Stop Recording Failed: ${error.message}`);
      }
    }

    function toggleMute() {
      try {
        sdk.toggleMute();
      } catch (error) {
        showError(`Toggle Mute Failed: ${error.message}`);
      }
    }

    function toggleWebcam() {
      try {
        sdk.toggleWebcam();
        switchCameraButton.disabled = !sdk.mediaHandler?.isWebcamActive;
      } catch (error) {
        showError(`Toggle Webcam Failed: ${error.message}`);
      }
    }

    function toggleScreen() {
      try {
        sdk.toggleScreen();
      } catch (error) {
        showError(`Toggle Screen Share Failed: ${error.message}`);
      }
    }

    function switchCamera() {
      try {
        sdk.switchCamera();
      } catch (error) {
        showError(`Switch Camera Failed: ${error.message}`);
      }
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      sdk.destroy();
    });
  </script>
</body>
</html>
```

### Setup Instructions

1. **Install the SDK** :

```bash
   npm install gemini-live-web-sdk
```

1. **Copy the HTML** : Save the above code as `index.html` in your project directory.
2. **Serve the Application** : Use a local server to meet browser security requirements:

```bash
   npm install -g http-server
   http-server
```

   Open `http://localhost:8080/index.html` in a browser.

1. **Test Features** :

* Grant microphone and camera permissions.
* Click "Start Recording" to begin audio capture.
* Use "Toggle Webcam" or "Toggle Screen Share" to stream video.
* Click "Mute" to toggle the microphone.
* Use "Switch Camera" when the webcam is active.
* Monitor volume meters and console logs.

### API Reference

#### Constructor

```javascript
new GeminiLiveWebSDK(endpoint, token = null, options = {})
```

* `endpoint`: WebSocket URL (e.g., `http://localhost:8080`).
* `token`: JWT token for authentication (optional).
* `options`: Configuration object (e.g., `{ sampleRate: 24000 }`).

#### Methods

* `setVideoElement(videoElement)`: Set the `<video>` element for webcam/screen sharing.
* `startRecording()`: Begin audio recording and streaming.
* `stopRecording()`: Stop recording and clean up.
* `toggleWebcam()`: Start/stop webcam streaming.
* `toggleScreen()`: Start/stop screen sharing.
* `switchCamera()`: Switch between available cameras.
* `toggleMute()`: Toggle microphone mute.
* `createUserVolumeMeter(progressElement)`: Visualize user audio input.
* `createStreamVolumeMeter(progressElement)`: Visualize incoming audio.
* `sendToolResponse(functionResponses)`: Respond to tool calls.
* `on(event, callback)`: Subscribe to events.
* `off(event, callback)`: Unsubscribe from events.
* `destroy()`: Clean up resources.

#### Events

* `setupComplete`: Fired when the WebSocket connection is established.
* `recordingStarted`: Fired when recording begins.
* `recordingStopped`: Fired when recording stops.
* `audioReceived`: Fired when audio is received from the server.
* `toolCall`: Fired when a tool call is received.
* `muteToggled`: Fired when mute state changes.
* `error`: Fired on errors.
* `close`: Fired when the connection closes.

## Development

### Prerequisites

* Node.js
* Rollup (`npm install --save-dev rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-terser`)

### Building

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd gemini-live-web-sdk
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the package:
   ```bash
   npm run build
   ```

This generates:

* `dist/gemini-live-web-sdk.js` (CommonJS)
* `dist/gemini-live-web-sdk.mjs` (ESM)
* `dist/gemini-live-web-sdk.umd.js` (UMD)

### Project Structure

```
gemini-live-web-sdk/
├── src/
│   ├── index.js
│   ├── gemini-live-api.js
│   ├── all_audio_processing/
│   ├── media-handler.js
│   ├── volume-meter.js
│   ├── utils.js
├── dist/
│   ├── gemini-live-web-sdk.js
│   ├── gemini-live-web-sdk.mjs
│   ├── gemini-live-web-sdk.umd.js
├── package.json
├── rollup.config.js
```

## Troubleshooting

* **Error:** `GeminiLiveWebSDK is not a constructor`:
  * Use `new window.GeminiLiveWebSDK.GeminiLiveWebSDK`.
* **Error:** `Start recording before attaching a user volume meter`:
  * Set up volume meters in the `recordingStarted` event.
* **No Connection** :
* Verify the server is running at the specified endpoint.
* Check the token or use `null` if not required.
* **Browser Compatibility** :
* Use Chrome for best WebRTC support. Safari may require additional permissions.

## License

Apache License Version 2.0 - See LICENSE for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on the repository.
