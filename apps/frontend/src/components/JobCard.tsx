import { z } from 'zod';
import { useState, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';

import { api } from '../utils';
import BomTable from './BomTable';
import TitleBlock from './TitleBlock';
import PrintingDetail from './PrintingDetail';
import { generateJobCard } from '../services/jobCardService';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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
  Separator,
} from '@prodgenie/libs/ui';
import { BomItem } from '@prodgenie/libs/types';
import { useJobCardStore, useBomStore } from '@prodgenie/libs/store';
import { apiRoutes, jobCardFields } from '@prodgenie/libs/constant';
import { jobCardSchema, jobCardFormValues } from '@prodgenie/libs/schema';

interface JobCardProps {
  tables: {
    data?: {
      bom: BomItem[];
      titleBlock: any;
      printingDetails?: any;
    };
  };
  fileId: string;
  signedUrl: string;
  setJobCardUrl: (url: string) => void;
}

const JobCard = ({
  tables,
  fileId,
  signedUrl,
  setJobCardUrl,
}: JobCardProps) => {
  const { setBom, setTitleBlock, setSelectedItems, selectedItems } =
    useBomStore();
  const { setJobCardNumber, setScheduleDate, setPoNumber, setProductionQty } =
    useJobCardStore();

  const [activeTab, setActiveTab] = useState('select');
  const [isLoading, setIsLoading] = useState(true);
  const { jobCardData, setJobCardData } = useJobCardStore();

  const bom = tables.data?.bom || [];
  const titleBlock = tables.data?.titleBlock;
  const printingDetails = tables.data?.printingDetails;

  useEffect(() => {
    if (bom.length) {
      setBom(bom);
      setTitleBlock(titleBlock);
      setSelectedItems(bom.map((item) => item.slNo));
    } else {
      setSelectedItems([]);
    }
  }, [fileId, bom]);

  useEffect(() => {
    const fetchJobCardNo = async () => {
      try {
        const jobCardNo = await api.get(
          `${apiRoutes.jobCard.base}${apiRoutes.jobCard.getNumber}`
        );
        form.setValue('jobCardNumber', jobCardNo.data.data);
      } catch (err) {
        toast.error('Failed to fetch job card number.');
      }
    };
    fetchJobCardNo();
  }, []);

  useEffect(() => {
    const sequences = bom.map((b) => b.description);
    const getTemplateFieldsFromSequence = async (sequences: any[]) => {
      try {
        const responses = await Promise.all(
          sequences.map(async (sequence) => {
            const res = await api.get(
              `${apiRoutes.sequence.base}/getJobCardDataFromSequence/${sequence}`
            );
            return res.data;
          })
        );

        setJobCardData(...responses);
      } catch (err) {
        console.error('Error fetching job card data:', err);
      }
    };
    if (Array.isArray(sequences) && sequences.length > 0) {
      getTemplateFieldsFromSequence(sequences);
    }
  }, [bom]);

  // ⏳ Dynamic schema and fields
  const dynamicFields = jobCardData[0]?.fields;
  const dynamicSectionName = jobCardData[0]?.name;
  const dynamicSchema = (function (z) {
    return eval(jobCardData[0]?.schema);
  })(z); // dangerous execuction

  const mergedSchema = useMemo(() => {
    if (!dynamicSchema) return jobCardSchema;
    return jobCardSchema.merge(dynamicSchema);
  }, [dynamicSchema]);

  const staticDefaults = useMemo(() => {
    return jobCardFields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue;
      return acc;
    }, {} as jobCardFormValues);
  }, []);

  const dynamicDefaults = useMemo(() => {
    if (!dynamicFields?.fields) return {};
    return dynamicFields.fields.reduce((acc, field) => {
      const [parent, child] = field.name.split('.');
      acc[parent] = acc[parent] || {};
      acc[parent][child] = field.defaultValue;
      return acc;
    }, {} as any);
  }, [dynamicFields]);

  const form = useForm<jobCardFormValues>({
    resolver: zodResolver(mergedSchema),
    defaultValues: {
      ...staticDefaults,
      ...dynamicDefaults,
    },
  });

  // ✅ Ensure defaults reset once jobCardData is ready
  useEffect(() => {
    if (dynamicFields?.fields) {
      form.reset({
        ...staticDefaults,
        ...dynamicDefaults,
      });
      setIsLoading(false); // ✅ schema + defaults ready
    }
  }, [dynamicFields]);

  const onSubmit = async (jobCardForm: jobCardFormValues) => {
    try {
      setJobCardNumber(jobCardForm.jobCardNumber);
      setScheduleDate(new Date(jobCardForm.scheduleDate));
      setPoNumber(jobCardForm.poNumber);
      setProductionQty(jobCardForm.productionQty);

      function flattenObject(
        obj: Record<string, any>,
        parentKey = '',
        result: Record<string, any> = {}
      ): Record<string, any> {
        for (const key in obj) {
          const value = obj[key];
          const fullKey = parentKey ? `${parentKey}.${key}` : key;

          if (value && typeof value === 'object' && !Array.isArray(value)) {
            flattenObject(value, fullKey, result);
          } else {
            result[fullKey] = value;
          }
        }
        return result;
      }

      const jobCardData = {
        bom: bom.filter((item) => selectedItems.includes(item.slNo)),
        titleBlock,
        printingDetails,
        file: { id: fileId },
        jobCardForm: jobCardForm,
        signedUrl,
      };

      const jobCard = await generateJobCard(jobCardData);
      setJobCardUrl(jobCard.data.url);

      toast.success('Your Job Card is being generated. Please wait.');
      setActiveTab('form');
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
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full space-y-4"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="select">Bom Details</TabsTrigger>
                <TabsTrigger value="form">Job Card Details</TabsTrigger>
              </TabsList>

              <TabsContent value="select">
                <div className="p-4 flex flex-col gap-4">
                  <BomTable
                    bom={bom}
                    fileId={fileId}
                    setActiveItem={() => setActiveTab('form')}
                  />
                  <Separator />
                  <TitleBlock titleBlock={titleBlock} fileId={fileId} />
                  {printingDetails && (
                    <>
                      <Separator />
                      <PrintingDetail printingDetails={printingDetails} />
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="form">
                <div className="p-4">
                  {jobCardFields.map((item) => (
                    <FormField
                      control={form.control}
                      key={item.name}
                      name={item.name as keyof jobCardFormValues}
                      render={({ field }) => (
                        <FormItem className="pt-4">
                          <FormLabel>{item.label}</FormLabel>
                          <FormControl>
                            <Input
                              type={item.type}
                              placeholder={item.placeholder}
                              value={field.value ?? ''}
                              onChange={(e) =>
                                field.onChange(
                                  item.type === 'number'
                                    ? Number(e.target.value)
                                    : e.target.value
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  <FormProvider {...form}>
                    {jobCardData.map((fields, idx) => (
                      <div
                        className="space-y-4 border p-4 rounded-md mt-4"
                        key={idx}
                      >
                        <FormLabel>{fields.name}</FormLabel>
                        {fields?.fields?.map((f) => (
                          <FormField
                            control={form.control}
                            key={f.name}
                            name={f.name as any}
                            render={({ field }) => (
                              <FormItem className="pt-4">
                                <div className="flex">
                                  <FormLabel>{f.label}</FormLabel>
                                  <FormControl>
                                    <Input
                                      type={f.type}
                                      placeholder={f.placeholder}
                                      value={field.value ?? ''}
                                      onChange={(e) =>
                                        field.onChange(
                                          f.type === 'number'
                                            ? Number(e.target.value)
                                            : e.target.value
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    ))}
                  </FormProvider>

                  <Button type="submit" className="w-full mt-4">
                    Generate Job Cards
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default JobCard;
