import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Input,
  Form,
  Button,
} from '@prodgenie/libs/ui';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import BomTable from './BomTable';
import { useJobStore } from '@prodgenie/libs/store';

type JobCardFormValues = {
  username: string;
  jobCardDate: string;
  productionQty: number;
};

const JobCard = ({ tables, fileId }: any) => {
  const bom = tables?.data?.bom || [];
  const form = useForm<JobCardFormValues>({
    defaultValues: {
      username: '',
      jobCardDate: '',
      productionQty: 0,
    },
  });
  const { setField } = useJobStore();

  const onSubmit = (data: any) => {
    console.log('Form data:', data);
    // You can now send `data` to your backend or use it as needed
  };

  const [activeItem, setActiveItem] = useState('item-1');

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
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
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Card Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ABC-123-DEF"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setField('jobCardNumber', e.target.value);
                        }}
                      />
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
                      <Input
                        type="date"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setField('jobCardDate', e.target.value);
                        }}
                      />
                    </FormControl>
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
                      <Input
                        type="number"
                        placeholder="100"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setField('jobCardQty', e.target.value);
                        }}
                      />
                    </FormControl>
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
    </form>
  );
};

export default JobCard;
