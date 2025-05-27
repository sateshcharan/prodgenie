import { BomItem } from '@prodgenie/libs/types';

import api from '../utils/api';

export const generateJobCard = async ({
  file,
  bom,
  titleBlock,
  jobCardForm,
  signedUrl,
  printingDetails,
}: {
  bom: BomItem[];
  file: { id: string };
  titleBlock: any;
  jobCardForm: {
    jobCardNumber: string;
    scheduleDate: string;
    poNumber: string;
    productionQty: number;
  };
  signedUrl: string;
  printingDetails: {
    detail: string;
    color: string;
  }[];
}) => {
  return api.post('/api/jobCard/generate', {
    bom,
    file,
    jobCardForm,
    titleBlock,
    signedUrl,
    printingDetails,
  });
};
