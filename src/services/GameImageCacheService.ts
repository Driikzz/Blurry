export class GameImageCacheService {
  private imageCache: Map<string, Buffer>;
  private pendingImages: Map<string, Promise<Buffer>>;

  constructor() {
    this.imageCache = new Map<string, Buffer>();
    this.pendingImages = new Map<string, Promise<Buffer>>();
  }

  clearCacheForRound(gameRoundId: number): void {
    const roundPrefix = `${gameRoundId}:`;

    for (const key of this.imageCache.keys()) {
      if (key.startsWith(roundPrefix)) {
        this.imageCache.delete(key);
      }
    }

    for (const key of this.pendingImages.keys()) {
      if (key.startsWith(roundPrefix)) {
        this.pendingImages.delete(key);
      }
    }
  }

  async getOrCreateImageForRound(
    gameRoundId: number,
    blurStep: number,
    createImageCallback: () => Promise<Buffer>
  ): Promise<Buffer> {
    const cacheKey = this.createCacheKey(gameRoundId, blurStep);
    const cachedImage = this.imageCache.get(cacheKey);

    if (cachedImage !== undefined) {
      return cachedImage;
    }

    const pendingImage = this.pendingImages.get(cacheKey);
    if (pendingImage) {
      return pendingImage;
    }

    const imageCreation = createImageCallback().then((newImage) => {
      return newImage;
    });
    this.pendingImages.set(cacheKey, imageCreation);
    return imageCreation;
  }

  private createCacheKey(gameRoundId: number, blurStep: number): string {
    return `${gameRoundId}:${blurStep}`;
  }
}
