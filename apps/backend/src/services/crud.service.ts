import axios from 'axios';
import { StorageFileService } from '@prodgenie/libs/supabase';

export class CrudService {
  private readonly storageFileService: StorageFileService;

  constructor() {
    this.storageFileService = new StorageFileService();
  }

  async fetchJsonFromSignedUrl(path: string): Promise<any> {
    const url = await this.storageFileService.getSignedUrl(path);
    const { data } = await axios.get(url);
    return data;
  }
}
