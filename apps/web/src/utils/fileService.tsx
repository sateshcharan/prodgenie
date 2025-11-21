import { apiRoutes } from '@prodgenie/libs/constant';

import api from './api';

export const fetchFilesByType = async (fileType: string) => {
  const {
    data: { files },
  } = await api.get(`${apiRoutes.files.base}/${fileType}/list?minimal=true`);
  return files || [];
};

export const getThumbnail = async (fileId: string) => {
  const { data } = await api.get(`${apiRoutes.thumbnail.base}/get/${fileId}`);
  return data?.data?.path;
};

export const getFileData = async (fileId: string) => {
  const { data } = await api.get(
    `${apiRoutes.files.base}/getFileData/${fileId}`
  );
  return data?.data;
};
