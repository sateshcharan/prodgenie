import axios from 'axios';

export const fetchFilesByType = async (fileType: string) => {
  const { data } = await axios.get(`/api/files/${fileType}/list`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return data?.data || [];
};

export const deleteFile = async (fileType: string, fileId: number) => {
  await axios.delete(`/api/files/${fileType}/${fileId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
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
