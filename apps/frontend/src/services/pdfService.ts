import axios from 'axios';

export const parsePdfFromUrl = async (signedUrl: string, fileId: string) => {
  const cacheKey = `tables-${fileId}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  const token = localStorage.getItem('token');
  const response = await axios.post(
    '/api/pdf/parse',
    { signedUrl },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  localStorage.setItem(cacheKey, JSON.stringify(response.data));
  return response.data;
};
