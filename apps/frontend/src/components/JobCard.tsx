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

type JobCardFormValues = {
  username: string;
};

const JobCard = ({ tables, fileId }: any) => {
  const bom = tables?.data?.bom || [];
  const form = useForm<JobCardFormValues>({
    defaultValues: {
      username: '',
    },
  });

  const [activeItem, setActiveItem] = useState('item-1');

  return (
    <Form {...form}>
      <Accordion
        type="single"
        className="w-full"
        collapsible
        value={activeItem} // <-- Control active accordion item
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
                    <Input placeholder="ABC-123-DEF" {...field} />
                  </FormControl>
                  <FormMessage />

                  <FormLabel>
                    Job Card Date
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormLabel>

                  <FormLabel>
                    Production Qty
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} />
                    </FormControl>
                  </FormLabel>

                  <Button
                    type="button"
                    onClick={() => setActiveItem('item-2')}
                    className="mt-4"
                  >
                    Next
                  </Button>
                </FormItem>
              )}
            />
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
