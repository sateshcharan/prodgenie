import axios from 'axios';
import { FileStorageService } from '@prodgenie/libs/supabase';

export class CrudService {
  private readonly fileStorageService: FileStorageService;

  constructor() {
    this.fileStorageService = new FileStorageService();
  }

  async fetchJsonFromSignedUrl(path: string): Promise<any> {
    const url = await this.fileStorageService.getSignedUrl(path);
    const { data } = await axios.get(url);
    return data;
  }
}
