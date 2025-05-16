import axios from 'axios';

import { api } from '../utils';

import { apiRoutes } from '@prodgenie/libs/constant';

export const parsePdfFromUrl = async (signedUrl: string, fileId: string) => {
  const cacheKey = `tables-${fileId}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  const response = await api.post(
    `${apiRoutes.pdf.base}${apiRoutes.pdf.parse}`,
    { signedUrl }
  );

  localStorage.setItem(cacheKey, JSON.stringify(response.data));
  return response.data;
};
