import { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  toast,
} from '@prodgenie/libs/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import BomTable from './BomTable';
import { useJobCardStore } from '@prodgenie/libs/store';
import {
  generateJobCard,
  requestJobCardTemplates,
} from '../services/jobCardService';
import { useBomStore } from '@prodgenie/libs/store';

const jobCardSchema = z.object({
  jobCardNumber: z.string().min(1, 'Job card number is required'),
  jobCardDate: z.string().min(1, 'Job card date is required'),
  jobCardQty: z
    .number({ invalid_type_error: 'Quantity must be a number' })
    .min(1, 'Quantity must be at least 1'),
});

type JobCardFormValues = z.infer<typeof jobCardSchema>;

const JobCard = ({
  tables,
  fileId,
}: {
  tables: { data?: { bom?: any[]; titleBlock?: any } };
  fileId: string;
}) => {
  const { bom, setBom, setSelectedItems, selectedItems } = useBomStore();
  const { setJobCardNumber, setJobCardDate, setJobCardQty } = useJobCardStore();
  const [activeItem, setActiveItem] = useState('item-1');
  const titleBlock = tables.data?.titleBlock;

  // Initialize BOM only once
  useEffect(() => {
    if (tables?.data?.bom?.length) {
      setBom(tables.data.bom);
      // Initial state for selected items (default all items selected)
      setSelectedItems(tables.data.bom.map((item) => item.slNo));
    }
  }, [tables, setBom, setSelectedItems]);

  const form = useForm<JobCardFormValues>({
    resolver: zodResolver(jobCardSchema),
    defaultValues: {
      jobCardNumber: '',
      jobCardDate: new Date().toISOString().split('T')[0],
      jobCardQty: 1,
    },
  });

  const onSubmit = async (data: JobCardFormValues) => {
    try {
      setJobCardNumber(data.jobCardNumber);
      setJobCardDate(new Date(data.jobCardDate));
      setJobCardQty(data.jobCardQty);

      await generateJobCard({
        bom: bom.filter((item) => selectedItems.includes(item.slNo)),
        titleBlock,
        fileId,
        jobCardData: data,
      });

      toast.success('Your Job Card is being generated. Please wait.');
      setActiveItem('item-2');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate Job Card. Please try again.');
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Accordion
              type="single"
              collapsible
              value={activeItem}
              onValueChange={(value) => setActiveItem(value)}
              className="w-full space-y-4"
            >
              {/* Item Selection Section */}
              <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger className="hover:no-underline py-4 px-6 bg-secondary rounded-lg">
                  Select Items
                </AccordionTrigger>
                <AccordionContent className="pt-6">
                  <BomTable
                    bom={bom}
                    fileId={fileId}
                    setActiveItem={setActiveItem}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Job Card Details Form */}
              <AccordionItem value="item-2" className="border-none">
                <AccordionTrigger className="hover:no-underline py-4 px-6 bg-secondary rounded-lg">
                  Please enter Job Card details
                </AccordionTrigger>
                <AccordionContent className="pt-6 space-y-6">
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
                    name="jobCardQty"
                    render={({ field: { onChange, ...rest } }) => (
                      <FormItem>
                        <FormLabel>Job Card Qty</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            onChange={(e) => onChange(Number(e.target.value))}
                            {...rest}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Generate Job Cards
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default JobCard;
