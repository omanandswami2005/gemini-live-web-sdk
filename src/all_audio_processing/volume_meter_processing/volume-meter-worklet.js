const SMOOTHING_FACTOR = 0.8;
const FRAME_PER_SECOND = 60;
const FRAME_INTERVAL = 1 / FRAME_PER_SECOND;

class VolumeMeter extends AudioWorkletProcessor {
  constructor() {
    super();
    this._lastUpdate = currentTime;
    this._volume = 0;
  }

  calculateRMS(inputChannelData) {
    // Check if inputChannelData is valid
    if (!inputChannelData || inputChannelData.length === 0) {
      // Return 0 volume if no data is available
      this._volume = Math.max(0, this._volume * SMOOTHING_FACTOR);
      return;
    }

    let sum = 0;
    for (let i = 0; i < inputChannelData.length; i++) {
      sum += inputChannelData[i] * inputChannelData[i];
    }
    const rms = Math.sqrt(sum / inputChannelData.length);
    this._volume = Math.max(rms, this._volume * SMOOTHING_FACTOR);
  }

  process(inputs, outputs) {
    const inputChannelData = inputs && inputs[0] && inputs[0][0] ? inputs[0][0] : null;
    if (currentTime - this._lastUpdate > FRAME_INTERVAL) {
      this.calculateRMS(inputChannelData);
      this.port.postMessage(this._volume);
      this._lastUpdate = currentTime;
    }
    return true;
  }
}

registerProcessor("volume-meter", VolumeMeter);