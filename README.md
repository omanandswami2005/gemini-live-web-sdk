# Gemini Live Web SDK

The `gemini-live-web-sdk` is a JavaScript library for integrating real-time audio and video streaming with the Gemini Live API. It provides features like audio recording, webcam and screen sharing, volume visualization, and tool call handling, making it ideal for building interactive web applications with voice and video capabilities.

## [Click Here for StackBlitz Project](https://stackblitz.com/edit/stackblitz-starters-6fcoinwx?file=index.html) (full-stack Example Use)

Note: Add Gemini API KEY in .env file😅

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
  const sdk = new GeminiLiveWebSDK('http://localhost:8080', "<Auth_Token>");
</script>
```

#### UMD (Browser)

Use a `<script>` tag for direct browser inclusion:

```html
<script src="https://cdn.jsdelivr.net/npm/gemini-live-web-sdk/dist/gemini-live-web-sdk.umd.js"></script>
<script>
  const sdk = new window.GeminiLiveWebSDK.GeminiLiveWebSDK('http://localhost:8080', "<Auth_Token>");
</script>
```

 *Note* : Access the class as `window.GeminiLiveWebSDK.GeminiLiveWebSDK` due to named export behavior.

#### CommonJS (Node.js/ReactJS)

Require the package in Node.js/ReactJS:

```javascript
const { GeminiLiveWebSDK } = require('gemini-live-web-sdk');
const sdk = new GeminiLiveWebSDK('http://localhost:8080');
```

 *Note* : ***This is primarily for React.js.***

## Usage

The SDK is designed for browser environments, interacting with a Gemini Live API server via WebSocket. Below is a full-fledged example demonstrating all features.

### Example: Interactive Audio/Video Application

This HTML example creates a web application with controls for audio recording, webcam, screen sharing, muting, and volume visualization.

Check-out the [URL ](https://stackblitz.com/edit/stackblitz-starters-6fcoinwx?file=index.html "Gemini Live Web SDK Stackblitz")for example usage code

### Setup Instructions

1. **Install the SDK** :

```bash
   npm install gemini-live-web-sdk
```

1. **Copy the HTML** : Save the above code from stackblitz in `index.html` in your project directory.
2. **Setup Rerspective WebSocket Server** :  [Check this NPM Package for server implementation](https://www.npmjs.com/package/gemini-live-ws-server "gemini-live-ws-server")
3. **Serve the Application** : Use a local server to meet browser security requirements:

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
* `sendTextMessage()`: Send Text Message To AI.
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
