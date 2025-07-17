import axios from 'axios';

export class ImageService {
  async generatePreview(signedUrl: string) {
    const file = await axios.get(signedUrl);
    console.log(file);
  }
}
