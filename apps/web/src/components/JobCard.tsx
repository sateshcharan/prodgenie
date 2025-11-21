import { z } from 'zod';
import { CheckCheck } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { Button } from '@prodgenie/libs/ui/button';
import { ScrollArea, ScrollBar } from '@prodgenie/libs/ui/scroll-area';
import { Separator } from '@prodgenie/libs/ui/separator';
import { toast } from 'sonner';
import { Card, CardContent } from '@prodgenie/libs/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@prodgenie/libs/ui/tabs';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from '@prodgenie/libs/ui/form';
import { BomItem } from '@prodgenie/libs/types';
import { StringService } from '@prodgenie/libs/shared-utils';
import { useJobCardStore, useBomStore } from '@prodgenie/libs/store';
import { jobCardSchema, jobCardFormValues } from '@prodgenie/libs/schema';
import { apiRoutes, jobCardFields, COLORS } from '@prodgenie/libs/constant';

import api from '../utils/api';
import BomTable from './BomTable';
import TitleBlock from './TitleBlock';
import RenderField from './RenderField';
import PrintingDetail from './PrintingDetail';
import PresetSelector from './PresetSelector';

const stringService = new StringService();

function getColorForItem(key: string) {
  const hash = key
    .split('')
    .reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}

const JobCard = ({
  tables,
  fileId,
  signedUrl,
  setJobCardUrl,
}: {
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
}) => {
  const { setBom, setTitleBlock, setSelectedItems, selectedItems } =
    useBomStore();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('select');
  // const [isLoading, setIsLoading] = useState(true);
  const { jobCardData, setJobCardData } = useJobCardStore();

  const bom = tables?.data?.bom;
  const titleBlock = tables?.data?.titleBlock;
  const printingDetails = tables?.data?.printingDetails;

  const generateJobCard = async ({
    file,
    bom,
    titleBlock,
    jobCardForm,
    signedUrl,
    printingDetails,
  }: {
    file: { id: string };
    bom: BomItem[];
    titleBlock: any;
    jobCardForm: jobCardFormValues;
    signedUrl: string;
    printingDetails: {
      detail: string;
      color: string;
    }[];
  }) => {
    return api.post('/api/jobCard/generate', {
      bom,
      file,
      jobCardForm,
      titleBlock,
      signedUrl,
      printingDetails,
    });
  };

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
            const { data } = await api.get(
              `${apiRoutes.sequence.base}/getJobCardDataFromSequence/${sequence}`
            );
            return { data, sequence };
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
        form.setValue('global.jobCardNumber', jobCardNo.data.data);
      } catch (err) {
        toast.error('Failed to fetch job card number.');
      }
    };
    fetchJobCardNo();
  }, []);

  // ⏳ Dynamic fields
  const dynamicFields = jobCardData.map((sequence) =>
    sequence.data.map((section) =>
      section.sections.map((section) => section.fields)
    )
  );

  const dynamicSchema = useMemo(() => {
    try {
      if (!jobCardData?.length) return undefined;

      const topShape: Record<string, any> = {};

      jobCardData.forEach((groupArray) => {
        const seqName = stringService.camelCase(groupArray.sequence);
        const groupShape: Record<string, any> = {};

        groupArray.data.forEach((group) => {
          const groupName = group.name;
          const subShapes: Record<string, any> = {};

          (group.sections || []).forEach((subSection: any) => {
            const fieldShape: Record<string, any> = {};

            (subSection.fields || []).forEach((f: any) => {
              if (f.type === 'number') {
                fieldShape[f.name] = z.preprocess((val) => {
                  if (val === '' || val === null || val === undefined)
                    return undefined;
                  return Number(val);
                }, z.number().min(1));
              } else if (f.type === 'string') {
                fieldShape[f.name] = z.string().min(1);
              } else if (f.type === 'select') {
                fieldShape[f.name] = z.string().min(1);
              } else if (f.type === 'boolean') {
                fieldShape[f.name] = z.boolean();
              } else {
                fieldShape[f.name] = z.any();
              }
            });

            subShapes[subSection.name] = z.object(fieldShape);
          });

          groupShape[groupName] = z.object(subShapes);
        });

        topShape[seqName] = z.object(groupShape);
      });

      // this dynamic schema now matches `sections`
      return z.object({
        sections: z.object(topShape),
      });
    } catch (e) {
      console.error('Failed to build dynamicSchema:', e);
      return undefined;
    }
  }, [jobCardData]);

  // Merge with static schema
  const mergedSchema = useMemo(() => {
    if (!dynamicSchema) return jobCardSchema;
    const merged = jobCardSchema.merge(dynamicSchema);
    return merged;
  }, [dynamicSchema, jobCardSchema]);

  // Build dynamic defaults matching nested shape used in your form names
  const dynamicDefaults = useMemo(() => {
    const defaults: Record<string, any> = {};

    if (!jobCardData?.length) return defaults;

    jobCardData.forEach((groupArray) => {
      groupArray.data.forEach((group) => {
        const groupName =
          // stringService.camelCase(groupArray.sequence) + '.' + group.name;
          stringService.camelCase(groupArray.sequence);
        defaults[groupName] = defaults[groupName] || {};
        (group.sections || []).forEach((subSection: any) => {
          defaults[groupName][subSection.name] =
            defaults[groupName][subSection.name] || {};

          (subSection.fields || []).forEach((f: any) => {
            // convert number defaultValue to a number if it's provided as string
            if (f.type === 'number') {
              defaults[groupName][subSection.name][f.name] =
                f.defaultValue !== undefined && f.defaultValue !== null
                  ? Number(f.defaultValue)
                  : undefined;
            } else {
              defaults[groupName][subSection.name][f.name] =
                f.defaultValue !== undefined ? f.defaultValue : '';
            }
          });
        });
      });
    });

    return defaults;
  }, [jobCardData]);

  const staticDefaults = useMemo(() => {
    return jobCardFields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue;
      return acc;
    }, {} as jobCardFormValues);
  }, []);

  const form = useForm<jobCardFormValues>({
    resolver: zodResolver(mergedSchema),
    defaultValues: {
      global: staticDefaults,
      sections: dynamicDefaults,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!dynamicFields?.fields) return;

    const merged = {
      ...staticDefaults,
      ...dynamicDefaults,
    };

    const currentValues = form.getValues();
    if (JSON.stringify(currentValues) !== JSON.stringify(merged)) {
      form.reset(merged);
    }
  }, [dynamicDefaults, staticDefaults]);

  // const onSubmit = async () => {
  //   try {
  //     const globalFields: Record<string, any> = {};
  //     const sections: Record<string, any> = {};

  //     const values = form.getValues();

  //     Object.entries(values).forEach(([key, value]) => {
  //       if (typeof value === 'object' && value !== null) {
  //         sections[key] = value; // dynamic section
  //       } else {
  //         globalFields[key] = value; // static/global
  //       }
  //     });

  //     const jobCardData = {
  //       bom: bom?.filter((item) => selectedItems.includes(item.slNo)),
  //       titleBlock,
  //       printingDetails,
  //       file: { id: fileId },
  //       jobCardForm: {
  //         global: globalFields,
  //         sections,
  //       },
  //       signedUrl,
  //     };

  //     console.log(jobCardData.jobCardForm);
  //     // 👇 send to backend
  //     const jobCard = await generateJobCard(jobCardData);
  //     setJobCardUrl(jobCard.data.url);

  //     toast.success('Your Job Card is being generated. Please wait.');
  //     setActiveTab('form');
  //   } catch (err) {
  //     console.error(err);
  //     toast.error('Failed to generate Job Card. Please try again.');
  //   }
  // };

  // const watchedValues = useWatch({ control: form.control });
  // useEffect(() => {
  //   console.log(watchedValues);
  // }, [watchedValues]);

  const onSubmit = async (values: jobCardFormValues) => {
    try {
      const jobCardData = {
        bom: bom?.filter((item) => selectedItems.includes(item.slNo)),
        titleBlock,
        printingDetails,
        file: { id: fileId },
        jobCardForm: values,
        signedUrl,
      };

      const jobCard = await generateJobCard(jobCardData);

      // setJobCardUrl(jobCard.data.url); // only if valid url is returned

      toast.success(
        'Your Job Card is being generated. You can wait here or monitor the progress from the dashboard.'
      );
      // setActiveTab('form');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate Job Card. Please try again.');
    }
  };

  return (
    <Card className="border-none ">
      <CardContent className="p-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.error('❌ Validation errors:', errors);
            })}
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className=" space-y-4"
              activationMode="manual"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="select">Bom Details</TabsTrigger>
                <TabsTrigger value="form">Job Card Details</TabsTrigger>
              </TabsList>

              {/* bom and printing details */}
              <TabsContent
                value="select"
                className="h-[calc(100vh-200px)] p-4 "
              >
                <div className="flex flex-col gap-4">
                  <BomTable
                    bom={bom}
                    fileId={fileId}
                    setActiveItem={() => setActiveTab('form')}
                  />
                  <Separator />
                  <TitleBlock titleBlock={titleBlock} fileId={fileId} />
                  <Separator />
                  {printingDetails && (
                    <PrintingDetail
                      printingDetails={printingDetails}
                      fileId={fileId}
                    />
                  )}
                </div>
              </TabsContent>

              {/* job card details */}
              <TabsContent value="form">
                <div className="p-4">
                  <h3 className="text-md font-semibold mb-2">Preset Options</h3>
                  <PresetSelector
                    getValues={form.getValues}
                    setValues={(vals) => form.reset(vals)}
                    activeDrawingId={fileId}
                  />
                  <Separator className="mt-4" />

                  <Button
                    type="submit"
                    className={`w-full my-4 ${
                      !form.formState.isValid
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    disabled={!form.formState.isValid}
                  >
                    Generate Job Cards
                  </Button>

                  <ScrollArea className="h-[calc(100vh-200px)]">
                    <ScrollBar orientation="horizontal" />
                    {/* static job card fields */}
                    <h3 className="text-md font-semibold mb-2 ">
                      JobCard Fields
                    </h3>
                    <div className="space-y-2 ml-2 border-l-2 pl-2">
                      <h3 className="text-md font-semibold capitalize">
                        Global Fields
                      </h3>
                      {jobCardFields.map((item) => (
                        <FormField
                          control={form.control}
                          key={item.name}
                          // name={item.name as keyof jobCardFormValues}
                          name={`global.${item.name}` as const}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2 ">
                                <FormLabel className="flex items-center gap-2">
                                  <CheckCheck width={16} />
                                  <span className="whitespace-nowrap">
                                    {item.label}
                                  </span>
                                </FormLabel>
                                <FormControl>
                                  <RenderField
                                    fieldConfig={item}
                                    rhfField={field}
                                  />
                                </FormControl>
                              </div>
                              <FormMessage className="w-full text-right" />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>

                    {/* dynamic job card fields */}
                    <FormProvider {...form}>
                      {jobCardData.map(({ data, sequence }, idx) => (
                        <div
                          className={`space-y-4 border p-4 rounded-md mt-4 ${getColorForItem(
                            sequence
                          )}`}
                          key={idx}
                        >
                          <h3 className="text-lg font-semibold capitalize">
                            {sequence}
                          </h3>

                          {data.map((group, gi) => (
                            <div key={gi}>
                              {group.name && (
                                <FormLabel className="text-lg font-semibold capitalize">
                                  {group.name}
                                </FormLabel>
                              )}

                              {group.sections?.map((subSection, si) => (
                                <div
                                  key={si}
                                  className="space-y-2 border-l-2 pl-4 ml-2"
                                >
                                  {subSection.name && (
                                    <FormLabel className="text-lg font-semibold capitalize ">
                                      {subSection.name}
                                    </FormLabel>
                                  )}

                                  {subSection.fields?.map((field, fi) => (
                                    <FormField
                                      key={fi}
                                      control={form.control}
                                      name={`sections.${stringService.camelCase(
                                        sequence
                                      )}.${group.name}.${subSection.name}.${
                                        field.name
                                      }`}
                                      render={({ field: rhfField }) => (
                                        <FormItem>
                                          <div className="flex items-center gap-2">
                                            <FormLabel className="flex gap-2 items-center ">
                                              <CheckCheck width={16} />
                                              <span className="whitespace-nowrap">
                                                {field.label}
                                              </span>
                                            </FormLabel>
                                            <FormControl>
                                              <RenderField
                                                fieldConfig={field}
                                                rhfField={rhfField}
                                              />
                                            </FormControl>
                                          </div>
                                          <FormMessage className="w-full text-right" />
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
                  </ScrollArea>
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
