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
  ScrollBar,
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
import PresetSelector from './PresetSelector';

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

  const generateJobCard = async ({
    file,
    bom,
    titleBlock,
    jobCardForm,
    signedUrl,
    printingDetails,
  }: {
    bom: BomItem[];
    file: { id: string };
    titleBlock: any;
    jobCardForm: {
      jobCardNumber: string;
      scheduleDate: string;
      poNumber: string;
      productionQty: number;
    };
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

  // const dynamicSchema = useMemo(() => {
  //   try {
  //     if (!jobCardData?.length) return undefined;

  //     // Build section schemas
  //     const sectionsSchemas = jobCardData
  //       .flatMap((sections) =>
  //         sections.flatMap((section) =>
  //           section.sections.map((subSection) => {
  //             // Each subsection might define its own schema
  //             if (!subSection?.schema) return null;

  //             // Instead of eval, parse schema safely
  //             // e.g. schema stored like: { name: "Color", type: "string", required: true }
  //             const shape: Record<string, any> = {};
  //             subSection.fields.forEach((field) => {
  //               if (field.type === 'string') {
  //                 shape[field.name] = field.required
  //                   ? z.string().min(1)
  //                   : z.string().optional();
  //               }
  //               if (field.type === 'number') {
  //                 shape[field.name] = field.required
  //                   ? z.number()
  //                   : z.number().optional();
  //               }
  //               // add other field types here...
  //             });

  //             return { name: subSection.name, schema: z.object(shape) };
  //           })
  //         )
  //       )
  //       .filter(Boolean);

  //     console.log(sectionsSchemas, jobCardData);

  //     if (!sectionsSchemas.length) return undefined;

  //     // Merge into a single schema keyed by section name
  //     const dynamicObj: Record<string, any> = {};
  //     sectionsSchemas.forEach((s) => {
  //       dynamicObj[s!.name] = s!.schema;
  //     });

  //     return z.object(dynamicObj);
  //   } catch (e) {
  //     console.error('Failed to build schema:', e);
  //     return undefined;
  //   }
  // }, [jobCardData]);

  // const mergedSchema = useMemo(() => {
  //   if (!dynamicSchema) return jobCardSchema;
  //   return jobCardSchema.merge(dynamicSchema);
  // }, [dynamicSchema]);

  // const dynamicDefaults = useMemo(() => {
  //   if (!dynamicFields?.fields) return {};
  //   return dynamicFields.fields.reduce((acc, field) => {
  //     const [parent, child] = field.name.split('.');
  //     acc[parent] = acc[parent] || {};
  //     acc[parent][child] = field.defaultValue;
  //     return acc;
  //   }, {} as any);
  // }, [dynamicFields]);

  // build dynamicSchema (preserve top-level group -> subsection -> fields)
  const dynamicSchema = useMemo(() => {
    try {
      if (!jobCardData?.length) return undefined;

      const topShape: Record<string, any> = {};

      // jobCardData is e.g. [[ { name: 'thinBlade', sections: [...] }, { name: 'creasingSlotting', ... } ]]
      jobCardData.forEach((groupArray) => {
        groupArray.forEach((group) => {
          const groupName = group.name;
          const subShapes: Record<string, any> = {};

          (group.sections || []).forEach((subSection: any) => {
            const fieldShape: Record<string, any> = {};

            (subSection.fields || []).forEach((f: any) => {
              const t = f.type;

              if (t === 'number') {
                // Accept string numbers from form inputs and validate as numbers
                fieldShape[f.name] = z.preprocess((val) => {
                  if (val === '' || val === null || typeof val === 'undefined')
                    return undefined;
                  return Number(val);
                }, z.number().min(1));
              } else if (t === 'string') {
                fieldShape[f.name] = z.string().min(1);
              } else if (t === 'select') {
                // assume select values are strings; change to z.any() if not
                fieldShape[f.name] = z.string().min(1);
              } else if (t === 'boolean') {
                fieldShape[f.name] = z.boolean();
              } else {
                // fallback
                fieldShape[f.name] = z.any();
              }
            });

            subShapes[subSection.name] = z.object(fieldShape);
          });

          // make sure group has at least an object (a group can contain multiple subsections)
          topShape[groupName] = z.object(subShapes);
        });
      });

      return z.object(topShape);
    } catch (e) {
      console.error('Failed to build dynamicSchema:', e);
      return undefined;
    }
  }, [jobCardData]);

  // Merge with static schema
  const mergedSchema = useMemo(() => {
    if (!dynamicSchema) return jobCardSchema;
    const merged = jobCardSchema.merge(dynamicSchema);
    // console.log(
    //   'Merged schema (keys):',
    //   Object.keys((merged as any)?._def?.shape ?? {})
    // );
    return merged;
  }, [dynamicSchema, jobCardSchema]);

  // Build dynamic defaults matching nested shape used in your form names
  const dynamicDefaults = useMemo(() => {
    const defaults: Record<string, any> = {};

    if (!jobCardData?.length) return defaults;

    jobCardData.forEach((groupArray) => {
      groupArray.forEach((group) => {
        const groupName = group.name;
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

  // const watchedValues = useWatch({ control: form.control });
  // useEffect(() => {
  //   console.log(watchedValues);
  // }, [watchedValues]);

  return (
    <Card className="border-none ">
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className=" space-y-4"
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
                  {printingDetails && (
                    <>
                      <Separator />
                      <PrintingDetail printingDetails={printingDetails} />
                    </>
                  )}
                </div>
              </TabsContent>

              {/* job card details */}
              <TabsContent value="form">
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <ScrollBar orientation="horizontal" />
                  <div className="p-4">
                    <h3 className="text-md font-semibold mb-2">
                      Preset Options
                    </h3>
                    <PresetSelector
                      getValues={form.getValues}
                      setValues={(vals) => form.reset(vals)}
                      activeDrawingId={fileId}
                    />

                    <Separator className="my-4" />

                    {/* static job card fields */}
                    <h3 className="text-md font-semibold mb-2">
                      JobCard Fields
                    </h3>
                    <div className="space-y-4">
                      {jobCardFields.map((item) => (
                        <FormField
                          control={form.control}
                          key={item.name}
                          name={item.name as keyof jobCardFormValues}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center gap-2">
                                <FormLabel>{item.label}</FormLabel>
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
                                        <FormItem>
                                          <div className="flex items-center gap-2">
                                            <FormLabel>{field.label}</FormLabel>
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
