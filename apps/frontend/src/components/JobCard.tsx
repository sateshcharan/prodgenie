import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Form,
  Button,
} from '@prodgenie/libs/ui';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import BomTable from './BomTable';

type JobCardFormValues = {
  jobCardNumber: string;
  jobCardDate: string;
  productionQty: number;
};

const JobCard = ({ tables, fileId }: any) => {
  const bom = tables?.data?.bom || [];

  const form = useForm<JobCardFormValues>({
    defaultValues: {
      jobCardNumber: '',
      jobCardDate: '',
      productionQty: 1,
    },
  });

  const [activeItem, setActiveItem] = useState('item-1');

  return (
    <Form {...form}>
      <Accordion
        type="single"
        className="w-full"
        collapsible
        value={activeItem}
        onValueChange={(value) => setActiveItem(value)}
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>Please enter Job Card details</AccordionTrigger>
          <AccordionContent>
            <FormField
              control={form.control}
              name="jobCardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Card Number</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC-123-DEF" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobCardDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Card Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productionQty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Production Qty</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              onClick={() => setActiveItem('item-2')}
              className="mt-4"
            >
              Next
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>Review Job Details</AccordionTrigger>
          <AccordionContent>
            <BomTable bom={bom} fileId={fileId} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Form>
  );
};

export default JobCard;
