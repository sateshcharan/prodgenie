import { getFileData } from '../utils/fileService';

export const fileDetailsLoader = async ({ params, request }: any) => {
  const { fileId, fileType } = params;

  const fileData = await getFileData(fileId);

  return { fileId, fileType, fileData };
};
