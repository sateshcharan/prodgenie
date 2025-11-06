import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

import {
  apiRoutes,
  jobCardFields,
  preDefinedKeywords,
} from '@prodgenie/libs/constant';
import { useUserStore } from '@prodgenie/libs/store';

import { api } from '../utils';
import { getFileData } from '../utils/fileService';

let _cachedSuggestions: string[] | null = null;

export const useSuggestionTokens = (
  extraSuggestions: string[] = [],
  templateName?: string
) => {
  const [suggestions, setSuggestions] = useState<string[]>(
    _cachedSuggestions || []
  );

  const [searchParams] = useSearchParams();
  const fileId = searchParams.get('id');

  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const filetype = pathSegments[1];

  const user = useUserStore((state) => state.user);
  const hasFetchedRef = useRef(false);

  const stableUser = useMemo(() => user, []);
  const stableExtraSuggestions = useMemo(
    () => [...extraSuggestions],
    [extraSuggestions]
  );

  useEffect(() => {
    if (_cachedSuggestions) return;

    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const loadSuggestions = async () => {
      // global job card fields
      const jobCardSuggestions = jobCardFields.flatMap((field) =>
        field.fields
          ? field.fields.map((f) => `jobCardForm_${f.name.replace('.', '_')}`)
          : [`jobCardForm_${field.name.replace('.', '_')}`]
      );

      // bom fields
      const bomSuggestions: string[] = [];
      try {
        const {
          data: {
            data: { data: bomData },
          },
        } = await api.get(
          `${apiRoutes.workspace.base}/getWorkspaceConfig/bom.json`
        );

        for (const section in bomData) {
          const expected = bomData[section]?.header?.expected;
          if (Array.isArray(expected)) {
            bomSuggestions.push(
              ...expected.map((f: string) => `${section}_${f}`)
            );
          }
        }
      } catch (err) {
        console.error('Error fetching BOM config:', err);
      }

      // user fields
      const userSuggestions = Object.keys(stableUser).map(
        (key) => `user_${key}`
      );

      let allSuggestions = [
        ...jobCardSuggestions,
        ...bomSuggestions,
        ...userSuggestions,
        ...preDefinedKeywords,
        ...stableExtraSuggestions,
      ];

      if (fileId) {
        try {
          const {
            data: { data: dynamicFieldsData },
          } = await api.get(`${apiRoutes.files.base}/getFileData/${fileId}`);

          // dynamic job card fields
          const sections = dynamicFieldsData?.jobCardForm?.sections ?? [];

          const dynamicSuggestions = sections.flatMap((section: any) =>
            (section.fields || []).map(
              (f: any) =>
                `jobCardForm_${templateName}_${section.name}_${f.name
                  ?.split('.')
                  .join('_')}`
            )
          );

          allSuggestions = [...allSuggestions, ...dynamicSuggestions];
        } catch (err) {
          console.error('Error fetching dynamic job card fields:', err);
        }
      }

      _cachedSuggestions = allSuggestions;
      setSuggestions(allSuggestions);
    };

    loadSuggestions();
  }, [fileId, filetype, stableUser, stableExtraSuggestions]);

  return suggestions;
};
