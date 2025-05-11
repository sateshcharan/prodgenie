import { jobCardFields } from '@prodgenie/libs/constant';
import { JobCardFormValues } from '@prodgenie/libs/schema';
import { BomItem } from './bom.js';

type JobCardForm = JobCardFormValues;

interface JobCardRequest {
  user: any;
  bom: BomItem[];
  file: { id: string };
  jobCardForm: JobCardForm;
  titleBlock: any;
}

export type JobCard = typeof jobCardFields;
export type { JobCardForm, JobCardRequest };
