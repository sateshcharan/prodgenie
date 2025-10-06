import { useLocation, useSearchParams } from 'react-router-dom';
import { forwardRef, useEffect, useState, useRef, useMemo } from 'react';

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
  // apiRoutes,
  // jobCardFields,
  preDefinedOperators,
  // preDefinedKeywords,
} from '@prodgenie/libs/constant';
// import { useUserStore } from '@prodgenie/libs/store';
import { StringService } from '@prodgenie/libs/frontend-services';

// import { api } from '../utils';
import { useSuggestionTokens } from '../hooks/useSuggestionTokens';

// 🧩 DnD imports
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash } from 'lucide-react';

const stringService = new StringService();

interface SuggestionInputProps {
  readonly?: boolean;
  value: string;
  onChange?: (val: string) => void;
  extraSuggestions?: string[];
  templateName?: string;
}

interface SortableTokenProps {
  id: string;
  token: string;
  readonly?: boolean;
  onRemove: () => void;
}

// 🧩 Reusable draggable token component
function SortableToken({ id, token, readonly, onRemove }: SortableTokenProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-2 border  border-indigo-300 bg-indigo-50/60 text-indigo-900  pl-3 text-sm  hover:bg-indigo-100  "
    >
      {/* Left: Token label */}
      <span className="font-medium ">{token}</span>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-1">
        {/* Drag handle */}
        <Button
          {...attributes}
          {...listeners}
          className="text-red-500 hover:text-red-600  "
          size={'icon'}
          variant="outline"
          title="Drag to reorder"
        >
          <GripVertical />
        </Button>

        {/* Remove button */}
        {!readonly && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onRemove();
            }}
            className="text-red-500 hover:text-red-600 "
            size={'icon'}
            variant="outline"
            title="Remove token"
          >
            <Trash />
          </Button>
        )}
      </div>
    </div>
  );
}

const SuggestionInput = forwardRef<HTMLInputElement, SuggestionInputProps>(
  ({ readonly, value, onChange, extraSuggestions = [], templateName }, ref) => {
    const [tokens, setTokens] = useState<string[]>(() =>
      value ? value.split(' ') : []
    );
    const [open, setOpen] = useState(false);
    // const [suggestions, setSuggestions] = useState<string[]>([]);
    const suggestions = useSuggestionTokens(extraSuggestions, templateName);

    // const [searchParams] = useSearchParams();
    // const fileId = searchParams.get('id');

    // const location = useLocation();
    // const pathSegments = location.pathname.split('/').filter(Boolean);
    // const filetype = pathSegments[1];

    // const user = useUserStore((state) => state.user);

    // const stableUser = useMemo(() => user, []);
    // const stableExtraSuggestions = useMemo(() => [...extraSuggestions], []);
    // const hasFetchedSuggestionsRef = useRef(false);

    // useEffect(() => {
    //   if (hasFetchedSuggestionsRef.current) return;

    //   const loadSuggestions = async () => {
    //     //jobCardFields
    //     const jobCardSuggestions = jobCardFields.flatMap((field) =>
    //       field.fields
    //         ? field.fields.map((f) => `jobCardForm_${f.name.replace('.', '_')}`)
    //         : [`jobCardForm_${field.name.replace('.', '_')}`]
    //     );

    //     const bomSuggestions: string[] = [];

    //     try {
    //       const {
    //         data: { data: bomFile },
    //       } = await api.get(`${apiRoutes.workspaces.base}/getWorkspaceConfig/bom.json`);
    //       const response = await fetch(bomFile.path);
    //       if (!response.ok) throw new Error('Failed to load config');
    //       const json = await response.json();

    //       for (const section in json) {
    //         const expected = json[section]?.header?.expected;
    //         if (Array.isArray(expected)) {
    //           bomSuggestions.push(
    //             ...expected.map((f: string) => `${section}_${f}`)
    //           );
    //         }
    //       }
    //     } catch (err) {
    //       console.error('Error fetching config:', err);
    //     }

    //     const userSuggestions = Object.keys(stableUser).map(
    //       (key) => `user_${key}`
    //     ); // user

    //     let allSuggestions = [
    //       ...jobCardSuggestions,
    //       ...bomSuggestions,
    //       ...userSuggestions,
    //       ...preDefinedKeywords,
    //       ...extraSuggestions,
    //     ];

    //     if (fileId) {
    //       try {
    //         const {
    //           data: { data: dynamicFieldsData },
    //         } = await api.get(`${apiRoutes.files.base}/getFileData/${fileId}`);
    //         const dynamicFields =
    //           dynamicFieldsData?.jobCardForm?.sections?.[0]?.fields ?? [];
    //         const dynamicSuggestions = dynamicFields.map(
    //           (f: any) => `jobCardForm_${f.name?.split('.').join('_')}`
    //         );
    //         allSuggestions = [...allSuggestions, ...dynamicSuggestions];
    //       } catch (err) {
    //         console.error('Error fetching dynamic job card fields:', err);
    //       }
    //     }

    //     setSuggestions(allSuggestions);
    //     hasFetchedSuggestionsRef.current = true;
    //   };

    //   loadSuggestions();
    // }, [fileId, extraSuggestions, user]);

    const updateTokens = (newTokens: string[]) => {
      setTokens(newTokens);
      onChange?.(newTokens.join(' '));
    };

    const addToken = (token: string) => {
      // if (!tokens.includes(token)) {
      updateTokens([...tokens, token]);
      // }
      setOpen(false);
    };

    const removeToken = (index: number) => {
      updateTokens(tokens.filter((_, i) => i !== index));
    };

    // 🧩 Setup sensors for drag-and-drop
    const sensors = useSensors(useSensor(PointerSensor));

    return (
      <div
        className="w-full border rounded p-2 flex flex-wrap gap-2 bg-white min-h-[40px]"
        ref={ref}
      >
        {/* {tokens.map((token, index) => (
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
        ))} */}

        {/* 🧩 DnD Context for reordering */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={({ active, over }) => {
            if (over && active.id !== over.id) {
              const oldIndex = tokens.findIndex((t) => t === active.id);
              const newIndex = tokens.findIndex((t) => t === over.id);
              const reordered = arrayMove(tokens, oldIndex, newIndex);
              updateTokens(reordered);
            }
          }}
        >
          <SortableContext items={tokens} strategy={rectSortingStrategy}>
            {tokens.map((token, index) => (
              <SortableToken
                key={`${token}-${index}`}
                id={token}
                token={token}
                readonly={readonly}
                onRemove={() => removeToken(index)}
              />
            ))}
          </SortableContext>
        </DndContext>

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

            <PopoverContent
              // className="p-0 w-[500px]"
              className="p-0 w-auto max-w-[90vw]"
            >
              <Command>
                <CommandInput placeholder="Search..." />
                {/* <div className="flex gap-2 p-2"> */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-2 p-2 max-w-full overflow-hidden">
                  {/* Variables Section */}
                  {/* <ScrollArea className="min-w-[200px] shrink-0 max-h-72 rounded-md border"> */}
                  <ScrollArea className="max-h-72 rounded-md border">
                    {Object.entries(
                      suggestions
                        .filter(
                          (s) =>
                            !preDefinedOperators.includes(s) && isNaN(Number(s))
                        )
                        .reduce<
                          Record<string, { key: string; label: string }[]>
                        >((acc, item) => {
                          // Preprocess once
                          const [prefix, ...rest] = item.split('_');
                          const group = prefix || 'Other';

                          // If it's formula_, extract label cleanly
                          const label =
                            prefix === 'formula' ? rest.join('_') : item;

                          acc[group] = [
                            ...(acc[group] || []),
                            { key: item, label },
                          ];
                          return acc;
                        }, {})
                    ).map(([group, items]) => (
                      <CommandGroup
                        key={group}
                        heading={
                          group === 'jobCardForm'
                            ? 'jobcard global fields'
                            : group === 'user'
                            ? 'user fields'
                            : group === 'formula'
                            ? 'formula fields'
                            : group === 'depField' || group === 'currentDate'
                            ? 'system fields'
                            : stringService.camelToNormal(group)
                        }
                      >
                        {items.map(
                          ({ key, label }) => (
                            <CommandItem
                              key={key}
                              onSelect={() => addToken(label)}
                              className="px-5"
                            >
                              {label}
                            </CommandItem>
                          )
                          // )
                        )}
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
