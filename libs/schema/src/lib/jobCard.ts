import { z } from 'zod';

// export const jobCardSchema = z.object({
//   jobCardNumber: z.string().min(1, 'Job card number is required'),
//   scheduleDate: z.string().min(1, 'Schedule date is required'),
//   poNumber: z.string().min(1, 'PO number is required'),
//   productionQty: z
//     .number({ invalid_type_error: 'Quantity must be a number' })
//     .min(1, 'Quantity must be at least 1'),
// });

const globalSchema = z.object({
  jobCardNumber: z.string().min(1, 'Job card number is required'),
  scheduleDate: z.string().min(1, 'Schedule date is required'),
  poNumber: z.string().min(1, 'PO number is required'),
  productionQty: z
    .number({ invalid_type_error: 'Quantity must be a number' })
    .min(1, 'Quantity must be at least 1'),
});

const sectionsSchema = z.any();

export const jobCardSchema = z.object({
  global: globalSchema,
  sections: sectionsSchema,
});

export type jobCardFormValues = z.infer<typeof jobCardSchema>;
