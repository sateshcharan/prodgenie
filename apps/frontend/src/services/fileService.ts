import { api } from '../utils';

import { apiRoutes } from '@prodgenie/libs/constant';

export const fetchFilesByType = async (fileType: string) => {
  const { data } = await api.get(`${apiRoutes.files.base}/${fileType}/list`);
  return data?.data || [];
};

export const getThumbnail = async (fileId: string) => {
  const { data } = await api.get(`/api/thumbnail/get/${fileId}`);
  return data?.data?.path;
};

export const deleteFile = async (fileType: string, fileId: string) => {
  await api.delete(`/api/files/${fileType}/${fileId}`);
};

export const downloadFile = async (path: string, name: string) => {
  const response = await fetch(path);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
