import { redirect } from 'react-router-dom';

import { FileType } from '@prodgenie/libs/constant';

export const fileBuilderLoader = async ({ params, request }: any) => {
  const { fileType } = params;

  if (fileType === 'table') return { fileType };

  if (!fileType || !Object.values(FileType).includes(fileType)) {
    return redirect('/404');
    // return null;
  }

  return { fileType };
};
