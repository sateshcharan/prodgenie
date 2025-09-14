// import { redirect } from 'react-router-dom';

import { FileType } from '@prodgenie/libs/constant';

export const fileDatasLoader = async ({ params, request }: any) => {
  const { fileType } = params;

  const additionalParams = ['settings'];

  if (
    !fileType ||
    !Object.values(FileType).includes(fileType) ||
    additionalParams.includes(fileType)
  ) {
    // return redirect('/404');
    return null;
  }

  return { fileType };
};
