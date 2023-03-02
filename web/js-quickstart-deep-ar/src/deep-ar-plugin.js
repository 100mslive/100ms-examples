import { DeepAR } from "deepar";
import deeparWasmPath from "deepar/wasm/deepar.wasm";
import faceTrackingModelPath from "deepar/models/face/models-68-extreme.bin";
import { HMSVideoPluginType } from "@100mslive/hms-video-store";
import * as effects from './effects';


class DeepARPlugin {
  deepAR = null;
  canvas = document.createElement("canvas");
  constructor() {

  }
  getName() {
    return "DeepARPlugin";
  }

  checkSupport() {
    return { isSupported: true };
  }

  async init() {
    return new Promise((resolve) => {
        try {

            this.deepAR = new DeepAR({
                licenseKey: "e02a087b1b17f50a0c673c81a27d0ef3fe87f78ca417e87768d158ecab151bb3205e424ce349553c",
                deeparWasmPath,
                canvas: this.canvas,
                callbacks: {
                    onInitialize: () => {
                        console.log("initialised");
                        // or we can setup the video element externally and call deepAR.setVideoElement (see startExternalVideo function below)
                        this.deepAR.downloadFaceTrackingModel(faceTrackingModelPath);
                        
                        this.deepAR.switchEffect(0, "slot", effects.viking, () => {
                            // effect loaded
                            resolve();
                        });
                    },
                },
            });
        } catch(error) {
            console.error(error);
        }
    });
  }

  getPluginType() {
    return HMSVideoPluginType.TRANSFORM;
  }

  applyEffect(effect) {
    this.deepAR.switchEffect(0, "slot", effect, () => {
      console.log("effect applied", effect);
    });
  }

  stop() {}

  /**
   * @param input {HTMLCanvasElement}
   * @param output {HTMLCanvasElement}
   */
  processVideoFrame(input, output) {
    output.width = input.width;
    output.height = input.height;
    const ctx = input.getContext("2d", { willReadFrequently: true });
    this.deepAR?.processFrame(
      ctx?.getImageData(0, 0, input.width, input.height).data,
      output.width,
      output.height,
      false
    );
    const outCtx = output.getContext("2d");
    outCtx?.drawImage(this.canvas, 0, 0, input.width, input.height);
  }
}

export const plugin = new DeepARPlugin();
