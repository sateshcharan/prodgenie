import { z } from 'zod';
import { useState, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';

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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Checkbox,
  ScrollArea,
  Toast,
} from '@prodgenie/libs/ui';
import { BomItem } from '@prodgenie/libs/types';
import { useJobCardStore, useBomStore } from '@prodgenie/libs/store';
import { apiRoutes, jobCardFields } from '@prodgenie/libs/constant';
import { jobCardSchema, jobCardFormValues } from '@prodgenie/libs/schema';

import { api } from '../utils';
import BomTable from './BomTable';
import TitleBlock from './TitleBlock';
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

function RenderField({ fieldConfig, rhfField, options = [] }: any) {
  switch (fieldConfig.type) {
    case 'select':
      return (
        <Select value={rhfField.value} onValueChange={rhfField.onChange}>
          <SelectTrigger>
            <SelectValue placeholder={fieldConfig.placeholder || 'Select'} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt: any, i: number) => (
              <SelectItem key={i} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'checkbox':
      return (
        <Checkbox
          checked={!!rhfField.value}
          onCheckedChange={rhfField.onChange}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          placeholder={fieldConfig.placeholder}
          value={rhfField.value ?? ''}
          onChange={(e) => rhfField.onChange(Number(e.target.value))}
        />
      );

    default:
      return (
        <Input
          type="text"
          placeholder={fieldConfig.placeholder}
          value={rhfField.value ?? ''}
          onChange={(e) => rhfField.onChange(e.target.value)}
        />
      );
  }
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
    if (!bom.length) return;

    const sequences = bom.map((b) => b.description);

    const getTemplateFieldsFromSequence = async () => {
      try {
        const responses = await Promise.all(
          sequences.map(async (sequence) => {
            const res = await api.get(
              `${apiRoutes.sequence.base}/getJobCardDataFromSequence/${sequence}`
            );
            return res.data;
          })
        );

        // Store expects an array, not spread args
        setJobCardData(responses);
      } catch (err) {
        console.error('Error fetching job card data:', err);
      }
    };

    getTemplateFieldsFromSequence();
  }, [bom, setJobCardData]);

  // ⏳ Dynamic schema and fields
  // const dynamicFields = jobCardData[0]?.fields;
  const dynamicFields = jobCardData?.[0]?.fields || { fields: [] };

  // const dynamicSectionName = jobCardData[0]?.name;

  // const dynamicSchema = (function (z) {
  //   return eval(jobCardData[0]?.schema);
  // })(z); // dangerous execuction
  const dynamicSchema = useMemo(() => {
    try {
      const rawSchema = jobCardData?.[0]?.schema;
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

  // const mergedSchema = useMemo(() => {
  //   if (!dynamicSchema) return jobCardSchema;
  //   return jobCardSchema.merge(dynamicSchema);
  // }, [dynamicSchema]);
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
  }, [dynamicDefaults, staticDefaults, dynamicFields]);

  const normalizedJobCardData = useMemo(() => {
    if (!jobCardData) return [];

    return jobCardData.map((item: any) => ({
      name: item.name,
      sections: (item.sections || []).map((section: any) => ({
        name: section.name,
        fields: section.fields,
        schema: section.schema,
      })),
    }));
  }, [jobCardData]);

  const onSubmit = async (jobCardForm: jobCardFormValues) => {
    try {
      setJobCardNumber(jobCardForm.jobCardNumber);
      setScheduleDate(new Date(jobCardForm.scheduleDate));
      setPoNumber(jobCardForm.poNumber);
      setProductionQty(jobCardForm.productionQty);

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

              <TabsContent value="form">
                <ScrollArea className="h-[calc(100vh-200px)]">
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
                                      name={field.name as any}
                                      render={({ field: rhfField }) => (
                                        <FormItem className="pt-2">
                                          <FormLabel>{field.label}</FormLabel>
                                          <FormControl>
                                            <RenderField
                                              fieldConfig={field}
                                              rhfField={field}
                                              options={field.options || []}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  ))}
                                </div>
                              ))}

                              <Separator />
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
