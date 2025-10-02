import { apiRoutes } from '@prodgenie/libs/constant';

import { api } from '.';

export const fetchFilesByType = async (fileType: string) => {
  const { data } = await api.get(`${apiRoutes.files.base}/${fileType}/list`);
  return data?.data || [];
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
