import { jobCardFields } from '@prodgenie/libs/constant';

interface JobCardItem {
  slNo: string;
  description: string;
  material: string;
  specification: string;
  ectBs: string;
  length: string;
  width: string;
  height: string;
  qty: string;
}

interface JobCardData {
  jobCardNumber: string;
  jobCardDate: Date;
  jobCardQty: number;
}

interface JobCardRequest {
  bom: JobCardItem[];
  fileId: string;
  jobCardData: JobCardData;
  user: any;
}

export type JobCard = typeof jobCardFields;
export type { JobCardItem, JobCardData, JobCardRequest };
