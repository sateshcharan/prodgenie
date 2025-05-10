import axios from 'axios';

export const requestJobCardTemplates = async ({
  bom,
  fileId,
  jobCardData,
  titleBlock,
}: {
  bom: any[];
  fileId: string;
  jobCardData: {
    jobCardNumber: string;
    jobCardDate: string;
    jobCardQty: number;
  };
  titleBlock: any;
}) => {
  return axios.post('/api/jobCard/getTemplates', {
    bom,
    fileId,
    jobCardData,
    titleBlock,
  });
};

export const generateJobCard = async ({
  bom,
  fileId,
  jobCardData,
  titleBlock,
}: {
  bom: any[];
  fileId: string;
  jobCardData: {
    jobCardNumber: string;
    jobCardDate: string;
    jobCardQty: number;
  };
  titleBlock: any;
}) => {
  return axios.post(
    '/api/jobCard/generate',
    {
      bom,
      fileId,
      jobCardData,
      titleBlock,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
};
