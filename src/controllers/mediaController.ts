import { Request, Response } from "express";
import { MediaService } from "../services/mediaService";

export class MediaController {
  mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  }

  async deleteMedia(req: Request, res: Response) {
    const mediaId = Number(req.params.id);

    if (!mediaId) return res.status(400).send();

    const media = await this.mediaService.getMediaById(mediaId);

    if (!media)
      return res
        .status(404)
        .send({ message: `Media not found with this id: ${mediaId}` });

    await media.remove();

    return res.status(204).send();
  }
}
