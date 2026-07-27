import sharp from "sharp";
import { BLUR_STEPS } from "../constants/GameConfig";

export class ImageService {
  async returnBlurredImage(
    imagePath: string,
    blurAmount: number
  ): Promise<Buffer> {
    const image = await sharp(imagePath)
      .blur(blurAmount)
      .jpeg()
      .toBuffer();
    return image;
  }

  async getImageForBlurStep(
    imagePath: string,
    blurStep: number
  ): Promise<Buffer> {
    const step = Math.max(
      0,
      Math.min(Math.floor(blurStep), BLUR_STEPS.length - 1)
    );
    const blurAmount = BLUR_STEPS[step];

    return this.returnBlurredImage(imagePath, blurAmount);
  }
}
