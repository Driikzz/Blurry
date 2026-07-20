import { Media } from "../entities/Media";

export class MediaService {
  async getMediaById(mediaId: number) {
    const media = await Media.findOne({ where: { id: mediaId } });
    return media;
  }
}
