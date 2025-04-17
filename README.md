# Gemini Live Web SDK

A JavaScript SDK for interacting with the Gemini Live API, enabling real-time audio and video communication.

## Installation

```bash
npm install gemini-live-web-sdk
```

## Usage

```javascript
import { GeminiLiveWebSDK } from 'gemini-live-web-sdk';

const sdk = new GeminiLiveWebSDK('http://localhost:8080', 'your-token-here');

sdk.on('setupComplete', () => {
  console.log('Connected and setup complete');
  sdk.startRecording();
});

sdk.on('audioReceived', (audioData) => {
  console.log('Received audio from server');
});

sdk.on('toolCall', (toolCall) => {
  const response = { /* process tool call */ };
  sdk.sendToolResponse(response);
});

sdk.on('error', (error) => {
  console.error('SDK Error:', error);
});

// Set video element for webcam/screen sharing
const videoElement = document.getElementById('videoPreview');
sdk.setVideoElement(videoElement);

// Add volume meters
sdk.createUserVolumeMeter(document.getElementById('volume-meter-user'));
sdk.createStreamVolumeMeter(document.getElementById('volume-meter-stream'));

// Toggle webcam
sdk.toggleWebcam();
```

## API

* `constructor(endpoint, token, options)`: Initialize the SDK.
* `startRecording()`: Start audio recording.
* `stopRecording()`: Stop audio recording.
* `toggleWebcam()`: Toggle webcam on/off.
* `toggleScreen()`: Toggle screen sharing on/off.
* `switchCamera()`: Switch between available cameras.
* `toggleMute()`: Toggle microphone mute.
* `setVideoElement(videoElement)`: Set the video element for webcam/screen sharing.
* `createUserVolumeMeter(progressElement)`: Attach a volume meter for user input.
* `createStreamVolumeMeter(progressElement)`: Attach a volume meter for incoming audio.
* `on(event, callback)`: Subscribe to events (e.g., `setupComplete`, `audioReceived`, `error`).
* `destroy()`: Clean up resources.

## License

This project is licensed under the Apache License.
