import { useLocation, useSearchParams } from 'react-router-dom';
import { forwardRef, useEffect, useState } from 'react';

import { api } from '../utils';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  Button,
  ScrollArea,
} from '@prodgenie/libs/ui';
import {
  apiRoutes,
  jobCardFields,
  preDefinedOperators,
  preDefinedKeywords,
} from '@prodgenie/libs/constant';
import { useUserStore } from '@prodgenie/libs/store';

interface SuggestionInputProps {
  readonly?: boolean;
  value: string;
  onChange?: (val: string) => void;
  extraSuggestions?: string[];
}

const SuggestionInput = forwardRef<HTMLInputElement, SuggestionInputProps>(
  ({ readonly, value, onChange, extraSuggestions = [] }, ref) => {
    const [tokens, setTokens] = useState<string[]>(() =>
      value ? value.split(' ') : []
    );
    const [open, setOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const [searchParams] = useSearchParams();
    const fileId = searchParams.get('id');

    const user = useUserStore((state) => state.user);

    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const filetype = pathSegments[1];

    useEffect(() => {
      const loadSuggestions = async () => {
        //jobCardFields
        const jobCardSuggestions = jobCardFields.flatMap((field) =>
          field.fields
            ? field.fields.map((f) => `jobCardForm_${f.name.replace('.', '_')}`)
            : [`jobCardForm_${field.name.replace('.', '_')}`]
        );
        const result: string[] = [];

        //dynamicJobCardFields todo: need to be set for templates per sequence // works in template builder not in formula builder
        //if (fileType === 'template')
        //if (fileType === 'sequence')
        //get consolidated dynamic fields data from sequence.json/jobcarddata

        if (filetype === 'template') {
          const dynamicJobCardFields = await api.get(
            `${apiRoutes.files.base}/getFileData/${fileId}`
          );
          const dynamicFields =
            dynamicJobCardFields.data.data.jobCard.formFields.fields;
          const dynamicJobCardSuggestions = dynamicFields.map((field) => {
            return `jobCardForm_${field.name.split('.').join('_')}`;
          });

          try {
            const rawFile = await api.get(
              `${apiRoutes.orgs.base}/getOrgConfig/bom.json`
            );
            const response = await fetch(rawFile.data.data.path);
            if (!response.ok) throw new Error('Failed to load config file');
            const json = await response.json();

            for (const section in json) {
              const expected = json[section]?.header?.expected;
              if (Array.isArray(expected)) {
                result.push(
                  ...expected.map((field: string) => `${section}_${field}`)
                );
              }
            }
          } catch (err) {
            console.error('Error fetching config:', err);
          }

          const userSuggestions = Object.keys(user).map((key) => `user_${key}`); // user

          setSuggestions([
            ...jobCardSuggestions,
            ...dynamicJobCardSuggestions,
            ...result,
            ...userSuggestions,
            ...preDefinedKeywords,
            ...extraSuggestions,
          ]);
        }
        if (filetype === 'sequence') {
          const dynamicJobCardFields = await api.get(
            `${apiRoutes.sequence.base}/getJobCardDataFromSequence/rsc.json`
          );

          //get jobcarddynamic fields for all templates of sequence consolidated
          console.log(dynamicJobCardFields.data);
          //   const dynamicFields =
          //     dynamicJobCardFields.data.data.jobCard.formFields.fields;
          //   const dynamicJobCardSuggestions = dynamicFields.map((field) => {
          //     return `jobCardForm_${field.name.split('.').join('_')}`;
          //   });

          try {
            const rawFile = await api.get(
              `${apiRoutes.orgs.base}/getOrgConfig/bom.json`
            );
            const response = await fetch(rawFile.data.data.path);
            if (!response.ok) throw new Error('Failed to load config file');
            const json = await response.json();

            for (const section in json) {
              const expected = json[section]?.header?.expected;
              if (Array.isArray(expected)) {
                result.push(
                  ...expected.map((field: string) => `${section}_${field}`)
                );
              }
            }
          } catch (err) {
            console.error('Error fetching config:', err);
          }

          const userSuggestions = Object.keys(user).map((key) => `user_${key}`); // user

          setSuggestions([
            ...jobCardSuggestions,
            // ...dynamicJobCardSuggestions,
            ...result,
            ...userSuggestions,
            ...preDefinedKeywords,
            ...extraSuggestions,
          ]);
        }
      };

      loadSuggestions();
    }, [extraSuggestions, user]); //extraSuggestions is causing infinite request loop

    const updateTokens = (newTokens: string[]) => {
      setTokens(newTokens);
      onChange?.(newTokens.join(' '));
    };

    const addToken = (token: string) => {
      if (!tokens.includes(token)) {
        updateTokens([...tokens, token]);
      }
      setOpen(false);
    };

    const removeToken = (index: number) => {
      updateTokens(tokens.filter((_, i) => i !== index));
    };

    return (
      <div
        className="w-full border rounded p-2 flex flex-wrap gap-2 bg-white min-h-[40px]"
        ref={ref}
      >
        {tokens.map((token, index) => (
          <span
            key={`${token}-${index}`}
            className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm flex items-center gap-1"
          >
            {token}
            {!readonly && (
              <button
                onClick={() => removeToken(index)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                ×
              </button>
            )}
          </span>
        ))}

        {!readonly && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                className="text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-gray-700"
              >
                + Add
              </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0 w-[500px]">
              <Command>
                <CommandInput placeholder="Search..." />
                <div className="flex gap-2 p-2">
                  {/* Variables Section */}
                  {/* Column 1: Dynamically grouped variables */}
                  <ScrollArea className="h-72 rounded-md border">
                    {Object.entries(
                      suggestions
                        .filter(
                          (s) =>
                            !preDefinedOperators.includes(s) && isNaN(Number(s))
                        )
                        .reduce<Record<string, string[]>>((acc, item) => {
                          const [prefix] = item.split('_');
                          const group = prefix || 'Other';
                          acc[group] = [...(acc[group] || []), item];
                          return acc;
                        }, {})
                    ).map(([group, items]) => (
                      <CommandGroup
                        key={group}
                        heading={
                          group === 'jobCardForm'
                            ? 'Job Card Fields'
                            : group === 'user'
                            ? 'User Fields'
                            : group === 'depField' || group === 'currentDate'
                            ? 'System Fields'
                            : group.toUpperCase()
                        }
                      >
                        {items.map((item) => (
                          <CommandItem
                            key={item}
                            onSelect={() => addToken(item)}
                            className="px-5
                          "
                          >
                            {item}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}
                  </ScrollArea>

                  {/* Operators */}
                  <ScrollArea className="h-72 rounded-md border flex flex-col justify-between ">
                    <CommandGroup heading="Operators">
                      {preDefinedOperators.map((op) => (
                        <CommandItem
                          key={`op-${op}`}
                          onSelect={() => addToken(op)}
                        >
                          {op}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </ScrollArea>

                  {/* Custom Input */}
                  <div className="p-2 border-t">
                    <label className="text-xs text-gray-500 mb-1 block">
                      Custom Number
                    </label>
                    <input
                      type="number"
                      className="w-full px-2 py-1 border rounded text-sm"
                      placeholder="Enter number"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.currentTarget.value || '').trim();
                          if (val) {
                            addToken(val);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  }
);

export default SuggestionInput;
