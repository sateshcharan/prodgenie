import { getFileData } from '../utils/fileService';

export interface FileDetailsLoaderTypes {
  fileId: string;
  fileType: string;
  fileData: any;
}

export const fileDetailsLoader = async ({
  params,
  request,
}: {
  params: FileDetailsLoaderTypes;
  request: any;
}) => {
  const { fileId, fileType } = params;

  const fileData = await getFileData(fileId);

  return { fileId, fileType, fileData };
};
