import { FileType } from '@prodgenie/libs/constant';
// import { redirect } from 'react-router-dom';

export const fileDatasLoader = async ({ params, request }: any) => {
  const { fileType } = params;

  if (!fileType || !Object.values(FileType).includes(fileType)) {
    // return redirect('/404');
    return null;
  }

  return { fileType };
};
