import { registeredWorklets } from "../src/audioworklet-registry.js";
export class VolumeMeter {
  constructor(audioContext, meterElement) {
    this.audioContext = audioContext;
    this.meterElement = meterElement;
    this.processor = null;
    console.log(`Creating VolumeMeter for element: ${meterElement.id}`);
  }

  async attachToSource(sourceNode) {
    console.log(`Attaching VolumeMeter to source for ${this.meterElement.id}`);
    const workletName = "volume-meter";
    if (!registeredWorklets.has(this.audioContext)) {
      registeredWorklets.set(this.audioContext, {});
    }
    const registry = registeredWorklets.get(this.audioContext);
    if (!registry[workletName]) {
      const workletUrl = new URL("https://cdn.jsdelivr.net/npm/gemini-live-web-sdk/dist/volume-meter-worklet.js").href;

      console.log(`Loading worklet for ${this.meterElement.id}: ${workletUrl}`);
      await this.audioContext.audioWorklet.addModule(workletUrl);
      registry[workletName] = true;
    }
    const workletNode = new AudioWorkletNode(this.audioContext, workletName);
    sourceNode.connect(workletNode);
    workletNode.port.onmessage = (event) => {
      const volume = event.data;
      const percentage = Math.min(100, Math.max(0, Math.floor(volume * 700)));
      this.meterElement.value = percentage;
      // Log volume updates for debugging
      //   console.log(`Volume update for ${this.meterElement.id}: ${percentage}%`);
    };
    this.processor = workletNode;
  }

  disconnect() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
      console.log(`Disconnected VolumeMeter for ${this.meterElement.id}`);
    }
  }
}