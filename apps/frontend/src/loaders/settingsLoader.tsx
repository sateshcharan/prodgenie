import { FileType } from '@prodgenie/libs/constant';
// import { redirect } from 'react-router-dom';

export const settingsLoader = async ({ params, request }: any) => {
  return { fileType: 'settings' };
};
