import sharp from "sharp";

export class ImageService {
  async returnBlurredImage(
    imagePath: string,
    blurAmount: number
  ): Promise<Buffer> {
    const image = await sharp(imagePath).blur(blurAmount).toBuffer();
    return image;
  }
}
