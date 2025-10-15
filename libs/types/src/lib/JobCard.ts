import { jobCardFields } from '@prodgenie/libs/constant';
import { jobCardFormValues } from '@prodgenie/libs/schema';
import { BomItem } from './bom.js';

type jobCardForm = jobCardFormValues;

interface jobCardRequest {
  user: any;
  bom: BomItem[];
  jobCardForm: jobCardForm;
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
export type { jobCardForm, jobCardRequest };
