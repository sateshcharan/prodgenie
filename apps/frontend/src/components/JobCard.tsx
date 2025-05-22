import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
import { useJobCardStore, useBomStore } from '@prodgenie/libs/store';
import { apiRoutes, jobCardFields } from '@prodgenie/libs/constant';
import { jobCardSchema, JobCardFormValues } from '@prodgenie/libs/schema';

import BomTable from './BomTable';
import { generateJobCard } from '../services/jobCardService';
import { BomItem } from '@prodgenie/libs/types';
import { api } from '../utils';

const JobCard = ({
  tables,
  fileId,
}: {
  tables: { data?: { bom: BomItem[]; titleBlock?: any } };
  fileId: string;
}) => {
  const navigate = useNavigate();
  const { setBom, setSelectedItems, selectedItems } = useBomStore();
  const { setJobCardNumber, setScheduleDate, setPoNumber, setProductionQty } =
    useJobCardStore();
  const [activeItem, setActiveItem] = useState('item-1');

  const titleBlock = tables.data?.titleBlock;
  const bom = tables.data?.bom;

  useEffect(() => {
    const fetchJobCardNo = async () => {
      const jobCardNo = await api.get(
        `${apiRoutes.jobCard.base}${apiRoutes.jobCard.getNumber}`
      );
      form.setValue('jobCardNumber', jobCardNo.data.data);
    };
    fetchJobCardNo();
  }, []);

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
    defaultValues: jobCardFields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue;
      return acc;
    }, {} as JobCardFormValues),
  });

  const onSubmit = async (jobCardForm: JobCardFormValues) => {
    try {
      setJobCardNumber(jobCardForm.jobCardNumber);
      setScheduleDate(new Date(jobCardForm.scheduleDate));
      setPoNumber(jobCardForm.poNumber);
      setProductionQty(jobCardForm.productionQty);

      const jobCardData = {
        bom: bom?.filter((item) => selectedItems.includes(item.slNo)),
        titleBlock,
        file: { id: fileId },
        jobCardForm,
      };
      await generateJobCard(jobCardData);
      navigate('/dashboard/jobCard');

      toast.success('Your Job Card is being generated. Please wait.');
      setActiveItem('item-2');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate Job Card. Please try again.');
    }
  };

  return (
    <Card className="border-none">
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Accordion
              type="single"
              collapsible
              value={activeItem}
              onValueChange={(value) => setActiveItem(value)}
              className="w-[400px] space-y-4"
            >
              {/* Item Selection Section */}
              <AccordionItem value="item-1">
                <AccordionTrigger className="hover:no-underline p-4  bg-secondary rounded-lg">
                  Select Items
                </AccordionTrigger>
                <AccordionContent className="p-4">
                  <BomTable
                    bom={bom || []}
                    fileId={fileId}
                    setActiveItem={setActiveItem}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Job Card Form Section */}
              <AccordionItem value="item-2" className="border-none">
                <AccordionTrigger className="hover:no-underline py-4 px-6 bg-secondary rounded-lg">
                  Please enter Job Card details
                </AccordionTrigger>
                <AccordionContent className="p-4">
                  {jobCardFields.map((f) => (
                    <FormField
                      control={form.control}
                      key={f.name}
                      name={f.name as keyof JobCardFormValues}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{f.label}</FormLabel>
                          <FormControl>
                            <Input
                              type={f.type}
                              placeholder={f.placeholder}
                              {...field}
                              onChange={(e) => {
                                const value =
                                  f.type === 'number'
                                    ? Number(e.target.value)
                                    : e.target.value;
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  <Button type="submit" className="w-full mt-4">
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
