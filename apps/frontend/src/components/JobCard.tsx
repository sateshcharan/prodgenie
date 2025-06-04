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
  signedUrl,
}: {
  tables: {
    data?: { bom: BomItem[]; titleBlock?: any; printingDetails?: any };
  };
  fileId: string;
  signedUrl: string;
}) => {
  const navigate = useNavigate();
  const { setBom, setSelectedItems, selectedItems } = useBomStore();
  const {
    setJobCardNumber,
    setScheduleDate,
    setPoNumber,
    setProductionQty,
    setRmBoardSize,
  } = useJobCardStore();
  const [activeItem, setActiveItem] = useState('item-1');

  const titleBlock = tables.data?.titleBlock;
  const bom = tables.data?.bom;
  const printingDetails = tables.data?.printingDetails;

  useEffect(() => {
    const fetchJobCardNo = async () => {
      const jobCardNo = await api.get(
        `${apiRoutes.jobCard.base}${apiRoutes.jobCard.getNumber}`
      );
      form.setValue('jobCardNumber', jobCardNo.data.data);
    };
    fetchJobCardNo();
  }, []);

  // // Initialize BOM only once
  // useEffect(() => {
  //   if (tables?.data?.bom?.length) {
  //     setBom(tables.data.bom);
  //     // Initial state for selected items (default all items selected)
  //     setSelectedItems(tables.data.bom.map((item) => item.slNo));
  //   }
  // }, [tables, setBom, setSelectedItems]);

  useEffect(() => {
    if (tables?.data?.bom?.length) {
      setBom(tables.data.bom);
      setSelectedItems(tables.data.bom.map((item) => item.slNo));
    } else {
      setSelectedItems([]); // reset when there's no BOM
    }
  }, [fileId, tables?.data?.bom]);

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
      setRmBoardSize({
        length: jobCardForm.rmBoardSize.length,
        width: jobCardForm.rmBoardSize.width,
      });

      const jobCardData = {
        bom: bom?.filter((item) => selectedItems.includes(item.slNo)),
        titleBlock,
        printingDetails,
        file: { id: fileId },
        jobCardForm,
        signedUrl,
      };
      await generateJobCard(jobCardData);
      // navigate('/dashboard/jobCard');

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
                        <FormItem className="pt-4">
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

                  <div className="flex flex-col pt-4">
                    <FormLabel className="w-full">RM Board Size</FormLabel>
                    <div className="flex">
                      <FormField
                        control={form.control}
                        name="rmBoardSize.length"
                        render={({ field }) => (
                          <FormItem className="w-1/2 pr-2">
                            <FormLabel>Length (mm)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g. 1300"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rmBoardSize.width"
                        render={({ field }) => (
                          <FormItem className="w-1/2 pl-2">
                            <FormLabel>Width (mm)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g. 1100"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

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
