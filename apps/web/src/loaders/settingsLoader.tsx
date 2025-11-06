// import { redirect } from 'react-router-dom';

import { FileType } from '@prodgenie/libs/constant';

export const settingsLoader = async ({ params, request }: any) => {
  return { fileType: 'settings' };
};
