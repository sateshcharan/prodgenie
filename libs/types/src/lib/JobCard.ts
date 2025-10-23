import { jobCardFields } from '@prodgenie/libs/constant';
import { jobCardFormValues } from '@prodgenie/libs/schema';

import { BomItem } from './bom.js';

interface jobCardRequest {
  user: any;
  bom: BomItem[];
  jobCardForm: jobCardFormValues;
  titleBlock: any;
  signedUrl: string;
  printingDetails: {
    printingDetail: string;
    printingColor: string;
    printingLocation: string;
    printingPart: string;
  }[];
  activeWorkspace: any;
}

export type jobCard = typeof jobCardFields;
export type { jobCardRequest };
