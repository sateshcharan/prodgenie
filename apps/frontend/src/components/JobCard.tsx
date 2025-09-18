import { z } from 'zod';
import { useState, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

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
  Form,
  Button,
  Card,
  CardContent,
  toast,
  Separator,
  ScrollArea,
} from '@prodgenie/libs/ui';
import { BomItem } from '@prodgenie/libs/types';
import { useJobCardStore, useBomStore } from '@prodgenie/libs/store';
import { apiRoutes, jobCardFields } from '@prodgenie/libs/constant';
import { jobCardSchema, jobCardFormValues } from '@prodgenie/libs/schema';

import { api } from '../utils';
import BomTable from './BomTable';
import TitleBlock from './TitleBlock';
import RenderField from './RenderField';
import PrintingDetail from './PrintingDetail';
import { generateJobCard } from '../services/jobCardService';

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
    if (!bom.length) {
      setSelectedItems([]);
      return;
    }

    setBom(bom);
    setTitleBlock(titleBlock);
    setSelectedItems(bom.map((item) => item.slNo));

    const getTemplateFieldsFromSequence = async () => {
      try {
        const sequences = bom.map((b) => b.description);
        const responses = await Promise.all(
          sequences.map(async (sequence) => {
            const res = await api.get(
              `${apiRoutes.sequence.base}/getJobCardDataFromSequence/${sequence}`
            );
            return res.data;
          })
        );
        setJobCardData(responses);
      } catch (err) {
        console.error('Error fetching job card data:', err);
      }
    };

    getTemplateFieldsFromSequence();
  }, [
    bom,
    titleBlock,
    setBom,
    setTitleBlock,
    setSelectedItems,
    setJobCardData,
  ]);

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

  // ⏳ Dynamic schema and fields
  const dynamicFields = jobCardData[0]?.map((section) =>
    section.sections.map((section) => section.fields)
  );

  // const dynamicSchema = (function (z) {
  //   return eval(jobCardData[0]?.schema);
  // })(z); // dangerous execuction
  const dynamicSchema = useMemo(() => {
    try {
      // const rawSchema = jobCardData?.[0]?.schema;
      const rawSchema = jobCardData[0]?.map((section) =>
        section.sections.map((section) => section.schema)
      );

      if (!rawSchema) return undefined;

      const buildSchema = new Function('z', `return (${rawSchema});`);
      const parsed = buildSchema(z);

      // const parsed = eval(rawSchema);
      return parsed && typeof parsed === 'object' ? parsed : undefined;
    } catch (e) {
      console.error('Failed to eval schema', e);
      return undefined;
    }
  }, [jobCardData]);

  const mergedSchema = useMemo(() => {
    if (!dynamicSchema || typeof dynamicSchema !== 'object')
      return jobCardSchema;
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

  useEffect(() => {
    if (!dynamicFields?.fields) return;

    const merged = {
      ...staticDefaults,
      ...dynamicDefaults,
    };

    // Only reset if form values are different
    const currentValues = form.getValues();
    if (JSON.stringify(currentValues) !== JSON.stringify(merged)) {
      form.reset(merged);

      setIsLoading(false);
    }
  }, [dynamicDefaults, staticDefaults]);

  const onSubmit = async () => {
    try {
      const values = form.getValues();

      const globalFields: Record<string, any> = {};
      const sections: Record<string, any> = {};

      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          sections[key] = value; // dynamic section
        } else {
          globalFields[key] = value; // static/global
        }
      });

      const structuredForm = {
        global: globalFields,
        sections,
      };

      // 👇 send to backend
      const jobCardData = {
        bom: bom.filter((item) => selectedItems.includes(item.slNo)),
        titleBlock,
        printingDetails,
        file: { id: fileId },
        jobCardForm: structuredForm,
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

  const watchedValues = useWatch({ control: form.control });
  useEffect(() => {
    console.log(watchedValues);
  }, [watchedValues]);

  return (
    <Card className="border-none ">
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

              {/* bom and printing details */}
              <TabsContent value="select">
                <ScrollArea className="h-[calc(100vh-200px)] ">
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
                </ScrollArea>
              </TabsContent>

              {/* job card details */}
              <TabsContent value="form">
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="p-4">
                    {/* static job card fields */}
                    {jobCardFields.map((item) => (
                      <FormField
                        control={form.control}
                        key={item.name}
                        name={item.name as keyof jobCardFormValues}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormLabel>{item.label}</FormLabel>
                            <FormControl>
                              <RenderField
                                fieldConfig={item}
                                rhfField={field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}

                    {/* dynamic job card fields */}
                    <FormProvider {...form}>
                      {jobCardData.map((sections, idx) => (
                        <div
                          className="space-y-4 border p-4 rounded-md mt-4"
                          key={idx}
                        >
                          {sections.map((fields, i) => (
                            <div key={i} className="space-y-2">
                              {fields.name && (
                                <FormLabel className="text-lg font-semibold capitalize">
                                  Section: {fields.name}
                                </FormLabel>
                              )}

                              {fields?.sections?.map((section) => (
                                <div
                                  key={section.name}
                                  className="space-y-2 border-l-2 pl-4 ml-2"
                                >
                                  <FormLabel className="text-lg font-semibold capitalize">
                                    {section.name}
                                  </FormLabel>

                                  {section.fields.map((field) => (
                                    <FormField
                                      control={form.control}
                                      key={field.name}
                                      name={
                                        `${fields.name}.${section.name}.${field.name}` as any
                                      }
                                      render={({ field: rhfField }) => (
                                        // (rhfField.name = `${fields.name}.${section.name}.${field.name}`),
                                        <FormItem className="flex items-center gap-2">
                                          <FormLabel>{field.label}</FormLabel>
                                          <FormControl>
                                            <RenderField
                                              fieldConfig={field}
                                              rhfField={rhfField}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  ))}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ))}
                    </FormProvider>

                    <Button type="submit" className="w-full mt-4">
                      Generate Job Cards
                    </Button>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default JobCard;
