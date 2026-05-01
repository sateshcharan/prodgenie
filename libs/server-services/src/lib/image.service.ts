import axios from 'axios';
// import QRCode from 'qrcode';

export class ImageService {
  async generatePreview(signedUrl: string) {
    const file = await axios.get(signedUrl);
    console.log(file);
  }
}
